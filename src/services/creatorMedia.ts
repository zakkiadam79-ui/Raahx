import { serviceApiUrl } from "./serviceStore";
import { CreatorApiError } from "./creatorStore";

export type CreatorUploadMode = "application" | "creator" | "admin";

export async function uploadCreatorImage(file: File, mode: CreatorUploadMode, token = ""): Promise<string> {
  const data = new FormData();
  data.append("image", file);
  if (token) data.append("token", token);
  let response: Response;
  try {
    response = await fetch(serviceApiUrl(`/creator-media/${mode}`), { method: "POST", credentials: "include", headers: { Accept: "application/json" }, body: data });
  } catch {
    throw new CreatorApiError(0, "NETWORK_ERROR", "The image upload service could not be reached.");
  }
  const payload = await response.json().catch(() => null) as { success?: boolean; data?: { url?: string }; error?: { code?: string; message?: string } } | null;
  if (!response.ok || payload?.success !== true || !payload.data?.url) throw new CreatorApiError(response.status, payload?.error?.code ?? "IMAGE_UPLOAD_FAILED", payload?.error?.message ?? "The image could not be uploaded.");
  return payload.data.url;
}

export function validateCreatorImageFile(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > 5 * 1024 * 1024) return "Image must be no larger than 5 MB.";
  return null;
}
