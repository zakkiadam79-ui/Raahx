import type { ServiceData } from "../data/servicesData";
import { getStoredServices, serviceApiUrl } from "./serviceStore";
import { getStoredTeamMembers } from "./teamStore";
import type { TeamMember } from "../data/teamData";
import { getStoredPosts, type BlogPost } from "./blogStore";
import { getStoredCaseStudies, type CaseStudyRecord } from "./caseStudyStore";

export const MIGRATION_VERSION = 1 as const;

export interface MigrationPayload {
  migration_version: typeof MIGRATION_VERSION;
  exported_at: string;
  services: Array<ServiceData & { id: string; display_order: number }>;
  team: Array<TeamMember & { display_order: number }>;
  blogs: Array<BlogPost & { display_order: number }>;
  case_studies: Array<CaseStudyRecord & { display_order: number }>;
}

export interface MigrationCounts {
  services: number;
  service_stats: number;
  service_process_steps: number;
  service_benefits: number;
  team_members: number;
  blogs: number;
  blog_content_blocks: number;
  blog_legacy_slugs: number;
  case_studies: number;
  case_study_approach_steps: number;
  case_study_metrics: number;
  case_study_legacy_slugs: number;
}

export interface MigrationValidationResult {
  valid: boolean;
  errors: string[];
  counts: MigrationCounts;
}

export interface MigrationApiResult {
  dry_run: boolean;
  imported: boolean;
  counts: MigrationCounts;
  message?: string;
  created?: Record<string, number>;
  updated?: Record<string, number>;
}

export class MigrationApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MigrationApiError";
  }
}

function deterministicServiceId(service: ServiceData): string {
  const existingId = (service as ServiceData & { id?: unknown }).id;
  return typeof existingId === "string" && existingId ? existingId : `service-${service.slug}`;
}

function toMigrationPayload(): MigrationPayload {
  // Read-only mode prevents the export from writing normalization markers or
  // changing the browser's existing content while preparing the backup.
  const services = getStoredServices({ persist: false, includeDefaults: true });
  const team = getStoredTeamMembers({ persist: false, includeDefaults: true });
  const blogs = getStoredPosts({ persist: false, includeDefaults: true });
  const caseStudies = getStoredCaseStudies({ persist: false, includeDefaults: true });

  return {
    migration_version: MIGRATION_VERSION,
    exported_at: new Date().toISOString(),
    services: services.map((service, display_order) => ({
      ...service,
      id: deterministicServiceId(service),
      display_order,
      stats: service.stats.map((stat, index) => ({ ...stat, display_order: index })),
      process: service.process.map((step, index) => ({ ...step, display_order: index })),
      benefits: service.benefits.map((benefit, index) => ({ ...benefit, display_order: index })),
    })),
    team: team.map((member, display_order) => ({ ...member, display_order })),
    blogs: blogs.map((blog, display_order) => ({
      ...blog,
      display_order,
      content: blog.content.map((block, index) => ({ ...block, display_order: index })),
    })),
    case_studies: caseStudies.map((study, display_order) => ({
      ...study,
      display_order,
      approach: study.approach.map((step, index) => ({ ...step, display_order: index })),
      metrics: study.metrics.map((metric, index) => ({ ...metric, display_order: index })),
    })),
  };
}

export function buildMigrationPayload(): MigrationPayload {
  const payload = toMigrationPayload();
  const validation = validateMigrationPayload(payload);
  if (!validation.valid) {
    throw new Error(`Migration payload is invalid:\n${validation.errors.join("\n")}`);
  }

  // This also catches accidental File/DOM/component values before export.
  try {
    JSON.stringify(payload);
  } catch {
    throw new Error("Migration payload contains a value that cannot be serialized as JSON.");
  }

  return payload;
}

export function validateMigrationPayload(payload: unknown): MigrationValidationResult {
  const errors: string[] = [];
  const emptyCounts: MigrationCounts = {
    services: 0,
    service_stats: 0,
    service_process_steps: 0,
    service_benefits: 0,
    team_members: 0,
    blogs: 0,
    blog_content_blocks: 0,
    blog_legacy_slugs: 0,
    case_studies: 0,
    case_study_approach_steps: 0,
    case_study_metrics: 0,
    case_study_legacy_slugs: 0,
  };

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { valid: false, errors: ["Migration payload must be an object."], counts: emptyCounts };
  }

  const value = payload as Record<string, unknown>;
  if (value.migration_version !== MIGRATION_VERSION) errors.push("migration_version must be 1.");
  if (typeof value.exported_at !== "string" || !value.exported_at) errors.push("exported_at is required.");

  const services = Array.isArray(value.services) ? value.services : [];
  const team = Array.isArray(value.team) ? value.team : [];
  const blogs = Array.isArray(value.blogs) ? value.blogs : [];
  const caseStudies = Array.isArray(value.case_studies) ? value.case_studies : [];

  if (!Array.isArray(value.services)) errors.push("services must be an array.");
  if (!Array.isArray(value.team)) errors.push("team must be an array.");
  if (!Array.isArray(value.blogs)) errors.push("blogs must be an array.");
  if (!Array.isArray(value.case_studies)) errors.push("case_studies must be an array.");

  const serviceIds = new Set<string>();
  const serviceSlugs = new Set<string>();
  let serviceStats = 0;
  let serviceProcessSteps = 0;
  let serviceBenefits = 0;

  services.forEach((service, index) => {
    if (!isRecord(service)) {
      errors.push(`services[${index}] must be an object.`);
      return;
    }
    requireString(service, "id", `services[${index}]`, errors);
    requireString(service, "name", `services[${index}]`, errors);
    requireString(service, "slug", `services[${index}]`, errors);
    requireString(service, "icon", `services[${index}]`, errors);
    checkUnique(serviceIds, service.id, `services[${index}].id`, errors);
    checkUnique(serviceSlugs, service.slug, `services[${index}].slug`, errors);
    serviceStats += arrayLength(service.stats);
    serviceProcessSteps += arrayLength(service.process);
    serviceBenefits += arrayLength(service.benefits);
  });

  const teamIds = new Set<string>();
  team.forEach((member, index) => {
    if (!isRecord(member)) {
      errors.push(`team[${index}] must be an object.`);
      return;
    }
    requireString(member, "id", `team[${index}]`, errors);
    requireString(member, "name", `team[${index}]`, errors);
    requireString(member, "role", `team[${index}]`, errors);
    checkUnique(teamIds, member.id, `team[${index}].id`, errors);
  });

  const blogIds = new Set<string>();
  const blogSlugs = new Set<string>();
  let blogContentBlocks = 0;
  let blogLegacySlugs = 0;
  blogs.forEach((blog, index) => {
    if (!isRecord(blog)) {
      errors.push(`blogs[${index}] must be an object.`);
      return;
    }
    requireString(blog, "id", `blogs[${index}]`, errors);
    requireString(blog, "title", `blogs[${index}]`, errors);
    requireString(blog, "slug", `blogs[${index}]`, errors);
    requireString(blog, "serviceSlug", `blogs[${index}]`, errors);
    requireString(blog, "author", `blogs[${index}]`, errors);
    requireString(blog, "date", `blogs[${index}]`, errors);
    requireString(blog, "excerpt", `blogs[${index}]`, errors);
    checkUnique(blogIds, blog.id, `blogs[${index}].id`, errors);
    checkUnique(blogSlugs, blog.slug, `blogs[${index}].slug`, errors);
    blogLegacySlugs += arrayLength(blog.legacySlugs);
    blogContentBlocks += arrayLength(blog.content);
    validateContentBlocks(blog.content, `blogs[${index}].content`, errors);

    if (typeof blog.serviceSlug === "string" && !serviceSlugs.has(blog.serviceSlug)) {
      errors.push(`blogs[${index}].serviceSlug does not reference an exported service.`);
    }
  });

  const caseStudyIds = new Set<string>();
  const caseStudySlugs = new Set<string>();
  let caseStudyApproachSteps = 0;
  let caseStudyMetrics = 0;
  let caseStudyLegacySlugs = 0;
  caseStudies.forEach((study, index) => {
    if (!isRecord(study)) {
      errors.push(`case_studies[${index}] must be an object.`);
      return;
    }
    requireString(study, "id", `case_studies[${index}]`, errors);
    requireString(study, "client", `case_studies[${index}]`, errors);
    requireString(study, "slug", `case_studies[${index}]`, errors);
    requireString(study, "industry", `case_studies[${index}]`, errors);
    checkUnique(caseStudyIds, study.id, `case_studies[${index}].id`, errors);
    checkUnique(caseStudySlugs, study.slug, `case_studies[${index}].slug`, errors);
    caseStudyApproachSteps += arrayLength(study.approach);
    caseStudyMetrics += arrayLength(study.metrics);
    caseStudyLegacySlugs += arrayLength(study.legacySlugs);
  });

  const counts: MigrationCounts = {
    services: services.length,
    service_stats: serviceStats,
    service_process_steps: serviceProcessSteps,
    service_benefits: serviceBenefits,
    team_members: team.length,
    blogs: blogs.length,
    blog_content_blocks: blogContentBlocks,
    blog_legacy_slugs: blogLegacySlugs,
    case_studies: caseStudies.length,
    case_study_approach_steps: caseStudyApproachSteps,
    case_study_metrics: caseStudyMetrics,
    case_study_legacy_slugs: caseStudyLegacySlugs,
  };

  return { valid: errors.length === 0, errors, counts };
}

export function downloadMigrationPayload(filename = "raahx-migration-v1.json"): MigrationPayload {
  const payload = buildMigrationPayload();
  if (typeof document === "undefined" || typeof URL === "undefined") {
    throw new Error("Migration download is only available in a browser.");
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return payload;
}

async function migrationApiRequest<T>(path: string, payload: MigrationPayload): Promise<T> {
  let response: Response;
  try {
    response = await fetch(serviceApiUrl(path), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new MigrationApiError(0, "NETWORK_ERROR", "The migration API could not be reached.");
  }

  const body = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok || body?.success !== true) {
    throw new MigrationApiError(
      response.status,
      body?.error?.code ?? "API_ERROR",
      body?.error?.message ?? "The migration API returned an error.",
    );
  }

  return body.data as T;
}

export async function validateMigrationViaApi(payload = buildMigrationPayload()): Promise<MigrationApiResult> {
  return migrationApiRequest<MigrationApiResult>("/migration/validate", payload);
}

export async function importMigrationViaApi(payload = buildMigrationPayload(), dryRun = false): Promise<MigrationApiResult> {
  const suffix = dryRun ? "?dry_run=1" : "";
  return migrationApiRequest<MigrationApiResult>(`/migration/import${suffix}`, payload);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string, path: string, errors: string[]): void {
  if (typeof record[key] !== "string" || record[key] === "") {
    errors.push(`${path}.${key} must be a non-empty string.`);
  }
}

function checkUnique(set: Set<string>, value: unknown, path: string, errors: string[]): void {
  if (typeof value !== "string" || value === "") return;
  if (set.has(value)) errors.push(`${path} is duplicated.`);
  set.add(value);
}

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function validateContentBlocks(value: unknown, path: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }

  value.forEach((block, index) => {
    if (!isRecord(block)) {
      errors.push(`${path}[${index}] must be an object.`);
      return;
    }
    if (!["paragraph", "heading", "quote", "list"].includes(String(block.type))) {
      errors.push(`${path}[${index}].type is invalid.`);
    }
    if (block.type === "list") {
      if (!Array.isArray(block.items) || block.items.some((item) => typeof item !== "string")) {
        errors.push(`${path}[${index}].items must be an array of strings.`);
      }
    } else if (typeof block.text !== "string") {
      errors.push(`${path}[${index}].text must be a string.`);
    }
  });
}
