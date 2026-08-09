import {
  defaultCaseStudies,
  type ApproachStep,
  type CaseStudyData,
  type Metric,
  type Testimonial,
} from "../data/caseStudiesData";

export type CaseStudyRecord = CaseStudyData & {
  id: string;
  legacySlugs?: string[];
};

export const CASE_STUDY_STORAGE_KEY = "raahx_casestudies_data";
const CASE_STUDY_MIGRATION_KEY = "raahx_casestudies_data_v2_migrated";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneApproach(approach: ApproachStep[]): ApproachStep[] {
  return approach.map((step) => ({ ...step }));
}

function cloneMetrics(metrics: Metric[]): Metric[] {
  return metrics.map((metric) => ({ ...metric }));
}

function cloneTestimonial(testimonial: Testimonial): Testimonial {
  return { ...testimonial };
}

function cloneCaseStudies(studies: CaseStudyRecord[]): CaseStudyRecord[] {
  return studies.map((study) => ({
    ...study,
    approach: cloneApproach(study.approach),
    metrics: cloneMetrics(study.metrics),
    testimonial: cloneTestimonial(study.testimonial),
    legacySlugs: study.legacySlugs ? [...study.legacySlugs] : undefined,
  }));
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getUniqueValue(value: unknown, fallback: string, used: Set<string>): string {
  const seed = typeof value === "string" && value.trim() ? value.trim() : fallback;
  let result = seed;
  let suffix = 2;

  while (used.has(result)) {
    result = `${seed}-${suffix}`;
    suffix += 1;
  }

  used.add(result);
  return result;
}

function normalizeApproach(value: unknown): ApproachStep[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((step) => ({
      title: typeof step.title === "string" ? step.title.trim() : "",
      description: typeof step.description === "string" ? step.description.trim() : "",
    }))
    .filter((step) => step.title || step.description);
}

function normalizeMetrics(value: unknown): Metric[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((metric) => ({
      label: typeof metric.label === "string" ? metric.label.trim() : "",
      value: typeof metric.value === "string" ? metric.value.trim() : "",
    }))
    .filter((metric) => metric.label || metric.value);
}

function normalizeTestimonial(value: unknown): Testimonial {
  if (!isRecord(value)) return { quote: "", author: "" };

  return {
    quote: typeof value.quote === "string" ? value.quote.trim() : "",
    author: typeof value.author === "string" ? value.author.trim() : "",
  };
}

function normalizeCaseStudy(
  value: unknown,
  index: number,
  usedIds: Set<string>,
  usedSlugs: Set<string>,
): CaseStudyRecord | null {
  if (!isRecord(value)) return null;

  const rawClient = typeof value.client === "string" ? value.client.trim() : "";
  const rawSlug = typeof value.slug === "string" ? value.slug : "";
  if (!rawClient && !rawSlug) return null;

  const client = rawClient || "Untitled Case Study";
  const slugSeed = normalizeSlug(rawSlug || client);
  if (!slugSeed) return null;

  const slug = getUniqueValue(slugSeed, `case-study-${index + 1}`, usedSlugs);
  const id = getUniqueValue(value.id, `case-study-${slug}`, usedIds);
  const industry = typeof value.industry === "string" ? value.industry.trim() : "";
  const challenge = typeof value.challenge === "string" ? value.challenge.trim() : "";
  const solution = typeof value.solution === "string" ? value.solution.trim() : "";
  const overview = typeof value.overview === "string" ? value.overview.trim() : "";
  const legacySlugs = Array.isArray(value.legacySlugs)
    ? value.legacySlugs
        .filter((legacySlug): legacySlug is string => typeof legacySlug === "string")
        .map(normalizeSlug)
        .filter((legacySlug) => legacySlug && legacySlug !== slug)
    : [];

  return {
    ...value,
    id,
    slug,
    client,
    industry,
    challenge,
    solution,
    overview,
    approach: normalizeApproach(value.approach),
    metrics: normalizeMetrics(value.metrics),
    testimonial: normalizeTestimonial(value.testimonial),
    legacySlugs: legacySlugs.length > 0 ? legacySlugs : undefined,
  } as CaseStudyRecord;
}

function createDefaultCaseStudies(): CaseStudyRecord[] {
  return defaultCaseStudies.map((study) => ({
    ...study,
    id: `case-study-${study.slug}`,
    approach: cloneApproach(study.approach),
    metrics: cloneMetrics(study.metrics),
    testimonial: cloneTestimonial(study.testimonial),
  }));
}

export const initialCaseStudies: CaseStudyRecord[] = createDefaultCaseStudies();

export function normalizeCaseStudies(value: unknown): CaseStudyRecord[] {
  if (!Array.isArray(value)) {
    return cloneCaseStudies(initialCaseStudies);
  }

  const usedIds = new Set<string>();
  const usedSlugs = new Set<string>();
  const normalized = value
    .map((study, index) => normalizeCaseStudy(study, index, usedIds, usedSlugs))
    .filter((study): study is CaseStudyRecord => study !== null);

  return value.length > 0 && normalized.length === 0 ? cloneCaseStudies(initialCaseStudies) : normalized;
}

function mergeLegacyDefaults(studies: CaseStudyRecord[]): CaseStudyRecord[] {
  const remaining = [...studies];
  const merged = initialCaseStudies.map((defaultStudy) => {
    const existingIndex = remaining.findIndex((study) =>
      study.slug === defaultStudy.slug || study.legacySlugs?.includes(defaultStudy.slug),
    );

    if (existingIndex === -1) {
      return {
        ...defaultStudy,
        approach: cloneApproach(defaultStudy.approach),
        metrics: cloneMetrics(defaultStudy.metrics),
        testimonial: cloneTestimonial(defaultStudy.testimonial),
      };
    }

    const [existing] = remaining.splice(existingIndex, 1);
    return existing;
  });

  // Custom or newly created studies retain their stored order after the original studies.
  return [...merged, ...remaining];
}

export function getStoredCaseStudies(options: { persist?: boolean } = {}): CaseStudyRecord[] {
  const persist = options.persist !== false;

  try {
    const saved = localStorage.getItem(CASE_STUDY_STORAGE_KEY);
    if (!saved) {
      return cloneCaseStudies(initialCaseStudies);
    }

    const parsed: unknown = JSON.parse(saved);
    let normalized = normalizeCaseStudies(parsed);
    const migrationComplete = localStorage.getItem(CASE_STUDY_MIGRATION_KEY) === "true";

    // Older admin data may contain only custom records. Restore the original
    // public studies once, then keep later edits/deletions authoritative.
    if (!migrationComplete) {
      normalized = mergeLegacyDefaults(normalized);
      if (persist) {
        localStorage.setItem(CASE_STUDY_MIGRATION_KEY, "true");
      }
    }

    const normalizedJson = JSON.stringify(normalized);
    if (persist && normalizedJson !== saved) {
      localStorage.setItem(CASE_STUDY_STORAGE_KEY, normalizedJson);
    }

    return normalized;
  } catch {
    // Invalid JSON or unavailable storage must never blank the public case studies.
    return cloneCaseStudies(initialCaseStudies);
  }
}

export function saveCaseStudies(studies: CaseStudyRecord[]): CaseStudyRecord[] {
  const normalized = normalizeCaseStudies(studies);

  try {
    localStorage.setItem(CASE_STUDY_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(CASE_STUDY_MIGRATION_KEY, "true");
  } catch {
    // Keep the admin UI usable if browser storage is unavailable.
  }

  return normalized;
}

export function getCaseStudyBySlug(studies: CaseStudyRecord[], slug: string): CaseStudyRecord | undefined {
  return studies.find((study) => study.slug === slug || study.legacySlugs?.includes(slug));
}

export function normalizeCaseStudySlug(value: string): string {
  return normalizeSlug(value);
}
