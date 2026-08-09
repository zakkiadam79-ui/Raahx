import {
  defaultCaseStudies,
  type ApproachStep,
  type CaseStudyData,
  type Metric,
  type Testimonial,
} from "../data/caseStudiesData";
import { isServiceApiConfigured, serviceApiUrl } from "./serviceStore";

export type CaseStudyRecord = CaseStudyData & {
  id: string;
  displayOrder?: number;
  legacySlugs?: string[];
};

export const CASE_STUDY_STORAGE_KEY = "raahx_casestudies_data";
const CASE_STUDY_MIGRATION_KEY = "raahx_casestudies_data_v2_migrated";

export class CaseStudyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CaseStudyApiError";
  }
}

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

function caseStudyApiErrorMessage(error: unknown): string {
  if (error instanceof CaseStudyApiError) {
    if (error.status === 401 || error.status === 403) return "The PHP API session is not authenticated. Sign in again before changing Case Study data.";
    return error.message;
  }
  return "The Case Study API is unavailable.";
}

async function caseStudyApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(serviceApiUrl(path), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new CaseStudyApiError(0, "NETWORK_ERROR", "The Case Study API could not be reached.");
  }

  const payload = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok || !payload?.success) {
    throw new CaseStudyApiError(
      response.status,
      payload?.error?.code ?? "API_ERROR",
      payload?.error?.message ?? "The Case Study API returned an error.",
    );
  }

  return payload.data as T;
}

function apiCaseStudyToRecord(value: unknown): CaseStudyRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const approach = Array.isArray(raw.approach)
    ? raw.approach.map((step) => {
        const item = step as Record<string, unknown>;
        return { title: String(item.title ?? ""), description: String(item.description ?? "") };
      })
    : [];
  const metrics = Array.isArray(raw.metrics)
    ? raw.metrics.map((metric) => {
        const item = metric as Record<string, unknown>;
        return { label: String(item.label ?? ""), value: String(item.value ?? "") };
      })
    : [];
  const testimonial = raw.testimonial && typeof raw.testimonial === "object"
    ? raw.testimonial as Record<string, unknown>
    : {};

  return normalizeCaseStudies([{
    ...raw,
    id: raw.id,
    client: raw.client ?? raw.client_name,
    slug: raw.slug,
    industry: raw.industry,
    overview: raw.overview,
    challenge: raw.challenge,
    solution: raw.solution,
    approach,
    metrics,
    testimonial: {
      quote: testimonial.quote ?? raw.testimonial_quote ?? "",
      author: testimonial.author ?? raw.testimonial_author ?? "",
    },
    legacySlugs: raw.legacy_slugs ?? raw.legacySlugs ?? [],
    displayOrder: raw.display_order ?? raw.displayOrder,
  }])[0] ?? null;
}

function caseStudyRecordToApiPayload(study: CaseStudyRecord, displayOrder?: number): Record<string, unknown> {
  return {
    ...(study.id ? { id: study.id } : {}),
    client_name: study.client,
    slug: study.slug,
    industry: study.industry,
    overview: study.overview,
    challenge: study.challenge,
    solution: study.solution,
    approach: study.approach.map((step, index) => ({ ...step, display_order: index })),
    metrics: study.metrics.map((metric, index) => ({ ...metric, display_order: index })),
    testimonial: study.testimonial,
    legacy_slugs: study.legacySlugs ?? [],
    display_order: displayOrder ?? study.displayOrder ?? 0,
  };
}

export async function fetchCaseStudiesFromApi(): Promise<CaseStudyRecord[]> {
  const data = await caseStudyApiRequest<unknown[]>("/case-studies");
  if (!Array.isArray(data)) {
    throw new CaseStudyApiError(502, "INVALID_API_RESPONSE", "The Case Study API returned invalid data.");
  }

  return normalizeCaseStudies(data.map(apiCaseStudyToRecord).filter((study): study is CaseStudyRecord => study !== null));
}

export async function fetchCaseStudyByIdFromApi(id: string): Promise<CaseStudyRecord> {
  const data = await caseStudyApiRequest<unknown>(`/case-studies/${encodeURIComponent(id)}`);
  const study = apiCaseStudyToRecord(data);
  if (!study) throw new CaseStudyApiError(502, "INVALID_API_RESPONSE", "The Case Study API returned an invalid record.");
  return study;
}

export async function fetchCaseStudyBySlugFromApi(slug: string): Promise<CaseStudyRecord> {
  const data = await caseStudyApiRequest<unknown>(`/case-studies/slug/${encodeURIComponent(slug)}`);
  const study = apiCaseStudyToRecord(data);
  if (!study) throw new CaseStudyApiError(502, "INVALID_API_RESPONSE", "The Case Study API returned an invalid record.");
  return study;
}

export async function createCaseStudyViaApi(study: CaseStudyRecord, displayOrder?: number): Promise<CaseStudyRecord> {
  const data = await caseStudyApiRequest<unknown>("/case-studies", {
    method: "POST",
    body: JSON.stringify(caseStudyRecordToApiPayload(study, displayOrder)),
  });
  const created = apiCaseStudyToRecord(data);
  if (!created) throw new CaseStudyApiError(502, "INVALID_API_RESPONSE", "The Case Study API returned an invalid record.");
  return created;
}

export async function updateCaseStudyViaApi(id: string, study: CaseStudyRecord, displayOrder?: number): Promise<CaseStudyRecord> {
  const data = await caseStudyApiRequest<unknown>(`/case-studies/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(caseStudyRecordToApiPayload({ ...study, id }, displayOrder)),
  });
  const updated = apiCaseStudyToRecord(data);
  if (!updated) throw new CaseStudyApiError(502, "INVALID_API_RESPONSE", "The Case Study API returned an invalid record.");
  return updated;
}

export async function deleteCaseStudyViaApi(id: string): Promise<void> {
  await caseStudyApiRequest<{ deleted: boolean }>(`/case-studies/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export { caseStudyApiErrorMessage, isServiceApiConfigured as isCaseStudyApiConfigured };
