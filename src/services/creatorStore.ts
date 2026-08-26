import { serviceApiUrl } from "./serviceStore";

export interface CreatorSocialRecord {
  platform: string;
  handle: string | null;
  profile_url: string;
  follower_count: number;
  follower_count_updated_at?: string;
  display_order: number;
}

export interface CreatorFeaturedWork {
  title: string;
  work_url: string;
  platform: string | null;
  thumbnail_url: string | null;
  display_order: number;
}

export interface CreatorBrandLovePoint {
  heading: string;
  detail: string;
  icon_key: string;
  display_order: number;
}

export interface CreatorRecord {
  id: string;
  display_name: string;
  name: string;
  full_name?: string;
  email?: string;
  whatsapp?: string | null;
  slug: string;
  profile_image_url: string | null;
  portfolio_url: string | null;
  short_bio: string | null;
  about: string | null;
  city: string | null;
  region: string | null;
  followers: number;
  followers_calculated: number;
  followers_override?: number | null;
  engagement_rate: number;
  compatibility_score: number | null;
  is_verified: boolean;
  status: "published" | "hidden";
  display_order: number;
  approved_at: string | null;
  socials: CreatorSocialRecord[];
  categories: string[];
  expertise: string[];
  collaboration_types: string[];
  featured_work: CreatorFeaturedWork[];
  brand_love_points: CreatorBrandLovePoint[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatorInput {
  full_name: string;
  display_name: string;
  email: string;
  whatsapp: string | null;
  slug: string;
  profile_image_url: string | null;
  portfolio_url: string | null;
  short_bio: string | null;
  about: string | null;
  city: string | null;
  region: string | null;
  followers_override: number | null;
  engagement_rate: number;
  compatibility_score: number | null;
  is_verified: boolean;
  status: "published" | "hidden";
  display_order: number;
  socials: CreatorSocialRecord[];
  categories: string[];
  expertise: string[];
  collaboration_types: string[];
  featured_work: CreatorFeaturedWork[];
  brand_love_points: CreatorBrandLovePoint[];
}

export type CreatorSelfInput = Pick<CreatorInput,
  "display_name" | "email" | "whatsapp" | "profile_image_url" | "portfolio_url" | "short_bio" | "about" |
  "city" | "region" | "socials" | "categories" | "expertise" | "collaboration_types" | "featured_work" | "brand_love_points"
>;

export interface CreatorApplicationInput extends CreatorSelfInput {
  full_name: string;
}

export interface CreatorApplication {
  id: string;
  full_name: string;
  display_name: string;
  email: string;
  whatsapp: string | null;
  profile_image_url: string | null;
  portfolio_url: string | null;
  short_bio: string | null;
  about: string | null;
  city: string | null;
  region: string | null;
  submitted_payload: {
    socials: CreatorSocialRecord[];
    categories: string[];
    expertise: string[];
    collaboration_types: string[];
    featured_work: CreatorFeaturedWork[];
  brand_love_points: CreatorBrandLovePoint[];
  };
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  reviewed_at: string | null;
  approved_creator_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollaborationRequestInput {
  creator_id: string;
  requester_name: string;
  company_name: string | null;
  email: string;
  whatsapp: string | null;
  campaign_type: string | null;
  campaign_budget: string | null;
  campaign_details: string;
  portfolio_url: string | null;
}

export interface CreatorFilters {
  search?: string;
  status?: "published" | "hidden" | "";
  city?: string;
  category?: string;
  platform?: string;
  sort?: "display_order" | "followers" | "engagement" | "name" | "newest";
}

export class CreatorApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = "CreatorApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  try {
    response = await fetch(serviceApiUrl(path), {
      ...init,
      credentials: "include",
      signal: controller.signal,
      headers: { Accept: "application/json", ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new CreatorApiError(0, "TIMEOUT", "The Creator API took too long to respond. Please retry.");
    throw new CreatorApiError(0, "NETWORK_ERROR", "The Creator API connection failed. Check your connection and retry.");
  } finally {
    window.clearTimeout(timeout);
  }
  const contentType = response.headers.get("content-type") ?? "";
  const payload = await response.json().catch(() => null) as { success?: boolean; data?: T; error?: { code?: string; message?: string } } | null;
  if (!payload || typeof payload !== "object") {
    const httpMessage = response.status === 401 ? "Creator API authentication is required."
      : response.status === 403 ? "Creator API access is forbidden."
      : response.status === 404 ? "The requested Creator API endpoint was not found."
      : response.status === 429 ? "Too many Creator requests were sent. Please wait and retry."
      : response.status === 500 ? "The Creator API server returned an invalid error response."
      : response.status === 502 ? "The Creator API gateway is temporarily unavailable."
      : response.status === 503 ? "The Creator API is temporarily unavailable. Please retry shortly."
      : null;
    throw new CreatorApiError(
      response.status,
      httpMessage ? `HTTP_${response.status}` : "INVALID_API_RESPONSE",
      httpMessage ?? (contentType.includes("text/html")
        ? "The Creator API returned the website HTML instead of JSON. Check the /api server routing."
        : "The Creator API returned an invalid non-JSON response."),
    );
  }
  if (!response.ok || payload.success !== true) {
    const fallback = response.status === 401 || response.status === 403
      ? "Creator API authentication is required."
      : response.status === 404
        ? "The requested Creator API endpoint was not found."
        : response.status === 429
          ? "Too many Creator requests were sent. Please wait and retry."
          : response.status === 502
            ? "The Creator API gateway is temporarily unavailable."
            : response.status === 503
              ? "The Creator API is temporarily unavailable. Please retry shortly."
              : response.status >= 500
                ? "The Creator API reported a server error."
                : "The Creator API returned an error.";
    throw new CreatorApiError(response.status, payload.error?.code ?? "API_ERROR", payload.error?.message ?? fallback);
  }
  return payload.data as T;
}

function query(filters: CreatorFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, value); });
  return params.size ? `?${params}` : "";
}

export function creatorError(error: unknown): string {
  if (error instanceof CreatorApiError) return error.message;
  return "The Creator service is temporarily unavailable.";
}

export const fetchPublicCreators = (filters: CreatorFilters = {}) => request<CreatorRecord[]>(`/creators${query(filters)}`);
export const fetchPublicCreator = (id: string) => request<CreatorRecord>(`/creators/${encodeURIComponent(id)}`);
export const fetchAdminCreators = (filters: CreatorFilters = {}) => request<CreatorRecord[]>(`/creators/admin${query(filters)}`);
export const fetchAdminCreator = (id: string) => request<CreatorRecord>(`/creators/admin/${encodeURIComponent(id)}`);
export const createCreator = (input: CreatorInput) => request<CreatorRecord>("/creators", { method: "POST", body: JSON.stringify(input) });
export const updateCreator = (id: string, input: CreatorInput) => request<CreatorRecord>(`/creators/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteCreator = (id: string) => request<{ deleted: boolean }>(`/creators/${encodeURIComponent(id)}`, { method: "DELETE" });

export const submitCreatorApplication = (input: CreatorApplicationInput) => request<{ id: string; status: string; message: string }>("/creator-applications", { method: "POST", body: JSON.stringify(input) });
export const fetchCreatorApplications = (status = "") => request<CreatorApplication[]>(`/creator-applications/admin${status ? `?status=${encodeURIComponent(status)}` : ""}`);
export const fetchCreatorApplication = (id: string) => request<CreatorApplication>(`/creator-applications/admin/${encodeURIComponent(id)}`);
export const approveCreatorApplication = (id: string, input: Record<string, unknown> = {}) => request<{ application: CreatorApplication; creator: CreatorRecord }>(`/creator-applications/admin/${encodeURIComponent(id)}/approve`, { method: "POST", body: JSON.stringify(input) });
export const rejectCreatorApplication = (id: string, admin_notes: string) => request<CreatorApplication>(`/creator-applications/admin/${encodeURIComponent(id)}/reject`, { method: "POST", body: JSON.stringify({ admin_notes }) });

export const verifyCreatorAccess = (token: string) => request<{ authenticated: boolean; creator: CreatorRecord }>("/creator-access/verify", { method: "POST", body: JSON.stringify({ token }) });
export const updateCreatorSelf = (token: string, profile: CreatorSelfInput) => request<CreatorRecord>("/creator-access/profile", { method: "PUT", body: JSON.stringify({ token, profile }) });
export const requestCreatorAccess = (email: string) => request<{ message: string }>("/creator-access/request", { method: "POST", body: JSON.stringify({ email }) });

export const submitCollaborationRequest = (input: CollaborationRequestInput) => request<{ id: number; status: string; message: string }>("/creator-collaboration-requests", { method: "POST", body: JSON.stringify(input) });
