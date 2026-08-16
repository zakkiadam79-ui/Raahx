import { servicesData, type ServiceData } from "../data/servicesData";
import {
  DEFAULT_SERVICE_ICON,
  getServiceIconName,
  type ServiceIconName,
} from "../utils/getServiceIcon";

export const SERVICE_STORAGE_KEY = "raahx_services_data";
const SERVICE_MIGRATION_KEY = "raahx_services_data_v2_migrated";

export type ServiceRecord = ServiceData & {
  id?: string;
  displayOrder?: number;
};

export class ServiceApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ServiceApiError";
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDefaultService(slug: string): ServiceData | undefined {
  return servicesData.find((service) => service.slug === slug);
}

/**
 * Converts a service loaded from storage into safe JSON-compatible data.
 * Existing fields are kept; only the icon value is normalized when needed.
 */
export function normalizeService(value: unknown): ServiceRecord | null {
  if (!isRecord(value) || typeof value.slug !== "string" || !value.slug) {
    return null;
  }

  const fallback = getDefaultService(value.slug);
  const fallbackIcon: ServiceIconName = fallback?.icon ?? DEFAULT_SERVICE_ICON;
  const normalizedIcon = getServiceIconName(value.icon, fallbackIcon);

  return {
    ...(fallback ?? {}),
    ...value,
    icon: normalizedIcon,
  } as ServiceData;
}

export function normalizeServices(value: unknown): ServiceRecord[] {
  if (!Array.isArray(value)) {
    return [...servicesData];
  }

  const normalized = value
    .map(normalizeService)
    .filter((service): service is ServiceRecord => service !== null);

  // If the stored value contains no usable service records, use the original
  // static services rather than rendering a blank or broken public section.
  return value.length > 0 && normalized.length === 0 ? [...servicesData] : normalized;
}

function mergeLegacyDefaults(services: ServiceRecord[]): ServiceRecord[] {
  const remaining = [...services];
  const merged = servicesData.map((defaultService) => {
    const existingIndex = remaining.findIndex((service) => service.slug === defaultService.slug);
    if (existingIndex === -1) return { ...defaultService };
    const [existing] = remaining.splice(existingIndex, 1);
    return existing;
  });

  return [...merged, ...remaining];
}

export function getStoredServices(options: { persist?: boolean; includeDefaults?: boolean } = {}): ServiceRecord[] {
  const persist = options.persist !== false;
  const includeDefaults = options.includeDefaults === true;

  try {
    const saved = localStorage.getItem(SERVICE_STORAGE_KEY);
    if (!saved) {
      return [...servicesData];
    }

    const parsed: unknown = JSON.parse(saved);
    let normalized = normalizeServices(parsed);
    const migrationComplete = localStorage.getItem(SERVICE_MIGRATION_KEY) === "true";
    if (includeDefaults || !migrationComplete) {
      normalized = mergeLegacyDefaults(normalized);
      if (persist) localStorage.setItem(SERVICE_MIGRATION_KEY, "true");
    }
    const normalizedJson = JSON.stringify(normalized);

    // This migrates legacy records such as icon: {} without touching unrelated
    // localStorage keys or removing any other service fields.
    if (persist && normalizedJson !== saved) {
      localStorage.setItem(SERVICE_STORAGE_KEY, normalizedJson);
    }

    return normalized;
  } catch {
    // Invalid JSON or unavailable storage must never take down the homepage.
    return [...servicesData];
  }
}

export function saveStoredServices(services: ServiceRecord[]): ServiceRecord[] {
  const normalized = normalizeServices(services);

  try {
    localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(SERVICE_MIGRATION_KEY, "true");
  } catch {
    // Keep the in-memory admin UI usable if browser storage is unavailable.
  }

  return normalized;
}

function configuredServiceApiBaseUrl(): string | undefined {
  const env = (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env;
  const value = env?.VITE_API_BASE_URL?.trim();
  return value ? value.replace(/\/$/, "") : undefined;
}

export function isServiceApiConfigured(): boolean {
  // The production API is same-origin by default. VITE_API_BASE_URL is only
  // needed when the PHP API is hosted on a separate origin.
  return true;
}

export function serviceApiUrl(path: string): string {
  const baseUrl = configuredServiceApiBaseUrl() ?? "/api";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function serviceApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    throw new ServiceApiError(0, "NETWORK_ERROR", "The Services API could not be reached.");
  }

  const payload = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok || !payload?.success) {
    throw new ServiceApiError(
      response.status,
      payload?.error?.code ?? "API_ERROR",
      payload?.error?.message ?? "The Services API returned an error.",
    );
  }

  return payload.data as T;
}

function apiServiceToRecord(value: unknown): ServiceRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const stats = Array.isArray(raw.stats)
    ? raw.stats.map((stat) => {
        const item = stat as Record<string, unknown>;
        return { label: String(item.label ?? ""), value: String(item.value ?? "") };
      })
    : [];
  const process = Array.isArray(raw.process)
    ? raw.process.map((step) => {
        const item = step as Record<string, unknown>;
        return { title: String(item.title ?? ""), description: String(item.description ?? "") };
      })
    : [];
  const benefits = Array.isArray(raw.benefits)
    ? raw.benefits.map((benefit) => {
        const item = benefit as Record<string, unknown>;
        return { title: String(item.title ?? ""), description: String(item.description ?? "") };
      })
    : [];
  const testimonial = raw.testimonial && typeof raw.testimonial === "object"
    ? raw.testimonial as Record<string, unknown>
    : {};

  const rawDisplayOrder = raw.display_order ?? raw.displayOrder;
  const displayOrder = rawDisplayOrder === undefined || rawDisplayOrder === null
    ? undefined
    : Number(rawDisplayOrder);

  return normalizeService({
    ...raw,
    id: typeof raw.id === "string" || typeof raw.id === "number" ? String(raw.id) : undefined,
    name: raw.name,
    slug: raw.slug,
    icon: raw.icon_identifier ?? raw.icon,
    heroTitle: raw.hero_title ?? raw.heroTitle ?? "",
    heroSubtitle: raw.hero_subtitle ?? raw.heroSubtitle ?? "",
    whyChooseTitle: raw.why_choose_title ?? raw.whyChooseTitle ?? "",
    whyChooseText: raw.why_choose_text ?? raw.whyChooseText ?? "",
    stats,
    process,
    benefits,
    testimonial: {
      quote: testimonial.quote ?? raw.testimonial_quote ?? "",
      author: testimonial.author ?? raw.testimonial_author ?? "",
    },
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : undefined,
  });
}

function serviceRecordToApiPayload(service: ServiceRecord, displayOrder?: number): Record<string, unknown> {
  return {
    ...(service.id ? { id: service.id } : {}),
    name: service.name,
    slug: service.slug,
    icon_identifier: service.icon,
    hero_title: service.heroTitle,
    hero_subtitle: service.heroSubtitle,
    overview: service.overview,
    why_choose_title: service.whyChooseTitle,
    why_choose_text: service.whyChooseText,
    stats: service.stats.map((stat, index) => ({ ...stat, display_order: index })),
    process: service.process.map((step, index) => ({ ...step, display_order: index })),
    benefits: service.benefits.map((benefit, index) => ({ ...benefit, display_order: index })),
    testimonial: service.testimonial,
    display_order: displayOrder ?? service.displayOrder ?? 0,
  };
}

export async function fetchServicesFromApi(): Promise<ServiceRecord[]> {
  const data = await serviceApiRequest<unknown[]>("/services");
  if (!Array.isArray(data)) {
    throw new ServiceApiError(502, "INVALID_API_RESPONSE", "The Services API returned invalid data.");
  }

  const services = data
    .map(apiServiceToRecord)
    .filter((service): service is ServiceRecord => service !== null);
  return normalizeServices(services);
}

export async function createServiceViaApi(service: ServiceRecord, displayOrder?: number): Promise<ServiceRecord> {
  const data = await serviceApiRequest<unknown>("/services", {
    method: "POST",
    body: JSON.stringify(serviceRecordToApiPayload(service, displayOrder)),
  });
  const record = apiServiceToRecord(data);
  if (!record) throw new ServiceApiError(502, "INVALID_API_RESPONSE", "The Services API returned an invalid service.");
  return record;
}

export async function updateServiceViaApi(id: string, service: ServiceRecord, displayOrder?: number): Promise<ServiceRecord> {
  const data = await serviceApiRequest<unknown>(`/services/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(serviceRecordToApiPayload({ ...service, id }, displayOrder)),
  });
  const record = apiServiceToRecord(data);
  if (!record) throw new ServiceApiError(502, "INVALID_API_RESPONSE", "The Services API returned an invalid service.");
  return record;
}

export async function deleteServiceViaApi(id: string): Promise<void> {
  await serviceApiRequest<{ deleted: boolean }>(`/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
