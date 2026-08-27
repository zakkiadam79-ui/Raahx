import type { CreatorFeaturedWork } from "../services/creatorStore";

export const CREATOR_FALLBACK_IMAGE = null;

function validHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function youtubeVideoId(workUrl: string): string | null {
  const url = parseHttpUrl(workUrl);
  if (!url) return null;

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  let candidate = "";

  if (hostname === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(hostname)) {
    if (url.pathname === "/watch") candidate = url.searchParams.get("v") ?? "";
    else {
      const parts = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live"].includes(parts[0] ?? "")) candidate = parts[1] ?? "";
    }
  }

  return /^[A-Za-z0-9_-]{6,20}$/.test(candidate) ? candidate : null;
}

function dailymotionVideoId(workUrl: string): string | null {
  const url = parseHttpUrl(workUrl);
  if (!url) return null;

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  let candidate = "";

  if (hostname === "dai.ly") candidate = parts[0] ?? "";
  else if (hostname === "dailymotion.com") {
    if (parts[0] === "video") candidate = parts[1] ?? "";
    else if (parts[0] === "embed" && parts[1] === "video") candidate = parts[2] ?? "";
  }

  // Dailymotion video IDs are alphanumeric. Reject every other character so
  // user input can never alter the deterministic thumbnail path.
  return /^[A-Za-z0-9]{5,20}$/.test(candidate) ? candidate : null;
}

/**
 * Returns an image safe for browser display without fetching or inspecting the
 * work URL server-side. Explicit thumbnail_url always wins. Only providers
 * with deterministic, allowlisted image URLs are resolved automatically;
 * Facebook, Instagram, TikTok, WhatsApp, and unknown hosts return no image so
 * the UI can render a neutral media placeholder rather than fake artwork.
 */
export function getCreatorWorkThumbnail(work: Pick<CreatorFeaturedWork, "work_url" | "thumbnail_url">): string | null {
  const explicit = validHttpUrl(work.thumbnail_url);
  if (explicit) return explicit;

  const youtubeId = youtubeVideoId(work.work_url);
  if (youtubeId) return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  const dailymotionId = dailymotionVideoId(work.work_url);
  if (dailymotionId) return `https://www.dailymotion.com/thumbnail/video/${dailymotionId}`;

  return CREATOR_FALLBACK_IMAGE;
}
