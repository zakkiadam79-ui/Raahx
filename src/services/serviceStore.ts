import { servicesData, type ServiceData } from "../data/servicesData";
import {
  DEFAULT_SERVICE_ICON,
  getServiceIconName,
  type ServiceIconName,
} from "../utils/getServiceIcon";

export const SERVICE_STORAGE_KEY = "raahx_services_data";

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
export function normalizeService(value: unknown): ServiceData | null {
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

export function normalizeServices(value: unknown): ServiceData[] {
  if (!Array.isArray(value)) {
    return [...servicesData];
  }

  const normalized = value
    .map(normalizeService)
    .filter((service): service is ServiceData => service !== null);

  // If the stored value contains no usable service records, use the original
  // static services rather than rendering a blank or broken public section.
  return value.length > 0 && normalized.length === 0 ? [...servicesData] : normalized;
}

export function getStoredServices(): ServiceData[] {
  try {
    const saved = localStorage.getItem(SERVICE_STORAGE_KEY);
    if (!saved) {
      return [...servicesData];
    }

    const parsed: unknown = JSON.parse(saved);
    const normalized = normalizeServices(parsed);
    const normalizedJson = JSON.stringify(normalized);

    // This migrates legacy records such as icon: {} without touching unrelated
    // localStorage keys or removing any other service fields.
    if (normalizedJson !== saved) {
      localStorage.setItem(SERVICE_STORAGE_KEY, normalizedJson);
    }

    return normalized;
  } catch {
    // Invalid JSON or unavailable storage must never take down the homepage.
    return [...servicesData];
  }
}

export function saveStoredServices(services: ServiceData[]): ServiceData[] {
  const normalized = normalizeServices(services);

  try {
    localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Keep the in-memory admin UI usable if browser storage is unavailable.
  }

  return normalized;
}
