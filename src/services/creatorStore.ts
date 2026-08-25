import { serviceApiUrl } from "./serviceStore";

export interface CreatorSocialRecord {
  platform: string;
  handle: string | null;
  profile_url: string | null;
  follower_count: number;
  display_order: number;
}

export interface CreatorRecord {
  id: string;
  name: string;
  slug: string;
  profile_image_url: string | null;
  short_bio: string | null;
  about: string | null;
  category: string | null;
  city: string | null;
  region: string | null;
  followers: number;
  engagement_rate: number;
  compatibility_score: number | null;
  is_verified: boolean;
  status: "published" | "hidden";
  display_order: number;
  socials: CreatorSocialRecord[];
  expertise: string[];
  collaboration_types: string[];
  created_at?: string;
  updated_at?: string;
}

export type CreatorInput = Omit<CreatorRecord, "id" | "created_at" | "updated_at">;

export interface CreatorAdminFilters {
  search?: string;
  status?: "published" | "hidden" | "";
  category?: string;
  city?: string;
  sort?: "display_order" | "followers" | "engagement" | "name" | "newest";
}

export class CreatorApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CreatorApiError";
  }
}

async function creatorApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    throw new CreatorApiError(0, "NETWORK_ERROR", "The Creator API could not be reached.");
  }

  const payload = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok || payload?.success !== true) {
    throw new CreatorApiError(
      response.status,
      payload?.error?.code ?? "API_ERROR",
      payload?.error?.message ?? "The Creator API returned an error.",
    );
  }

  return payload.data as T;
}

function filtersQuery(filters: CreatorAdminFilters): string {
  const query = new URLSearchParams();
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.status) query.set("status", filters.status);
  if (filters.category?.trim()) query.set("category", filters.category.trim());
  if (filters.city?.trim()) query.set("city", filters.city.trim());
  if (filters.sort) query.set("sort", filters.sort);
  const value = query.toString();
  return value ? `?${value}` : "";
}

export function creatorApiErrorMessage(error: unknown): string {
  if (error instanceof CreatorApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Your admin session is not authenticated. Sign in again before managing creators.";
    }
    return error.message;
  }
  return "The Creator API is unavailable.";
}

export async function fetchAdminCreators(filters: CreatorAdminFilters = {}): Promise<CreatorRecord[]> {
  const data = await creatorApiRequest<unknown>(`/creators/admin${filtersQuery(filters)}`);
  if (!Array.isArray(data)) {
    throw new CreatorApiError(502, "INVALID_API_RESPONSE", "The Creator API returned an invalid list.");
  }
  return data as CreatorRecord[];
}

export async function fetchAdminCreator(id: string): Promise<CreatorRecord> {
  return creatorApiRequest<CreatorRecord>(`/creators/admin/${encodeURIComponent(id)}`);
}

export async function createCreator(input: CreatorInput): Promise<CreatorRecord> {
  return creatorApiRequest<CreatorRecord>("/creators", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCreator(id: string, input: CreatorInput): Promise<CreatorRecord> {
  return creatorApiRequest<CreatorRecord>(`/creators/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteCreator(id: string): Promise<void> {
  await creatorApiRequest<{ deleted: boolean }>(`/creators/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
