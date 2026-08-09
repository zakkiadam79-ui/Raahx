import { blogsData, type BlogPost as StaticBlogPost } from "../data/blogsData";
import { isServiceApiConfigured, serviceApiUrl } from "./serviceStore";

export type BlogContentBlockType = "paragraph" | "heading" | "quote" | "list";

export interface BlogContentBlock {
  type: BlogContentBlockType;
  text?: string;
  items?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  serviceSlug: string;
  date: string;
  readTime: string;
  author: string;
  content: BlogContentBlock[];
  image?: string;
  legacySlugs?: string[];
  [key: string]: unknown;
}

export const BLOG_STORAGE_KEY = "raahx_blog_posts";
const BLOG_MIGRATION_KEY = "raahx_blog_data_v2_migrated";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneContent(content: BlogContentBlock[]): BlogContentBlock[] {
  return content.map((block) => ({
    ...block,
    items: block.items ? [...block.items] : undefined,
  }));
}

function clonePosts(posts: BlogPost[]): BlogPost[] {
  return posts.map((post) => ({
    ...post,
    content: cloneContent(post.content),
    legacySlugs: post.legacySlugs ? [...post.legacySlugs] : undefined,
  }));
}

function normalizeContent(value: unknown, fallbackText: string): BlogContentBlock[] {
  if (typeof value === "string") {
    return [{ type: "paragraph", text: value }];
  }

  if (!Array.isArray(value)) {
    return fallbackText ? [{ type: "paragraph", text: fallbackText }] : [];
  }

  const blocks = value
    .filter(isRecord)
    .map((block): BlogContentBlock | null => {
      const requestedType = block.type;
      const type: BlogContentBlockType =
        requestedType === "heading" || requestedType === "quote" || requestedType === "list"
          ? requestedType
          : "paragraph";
      const text = typeof block.text === "string" ? block.text : "";
      const items = Array.isArray(block.items)
        ? block.items.filter((item): item is string => typeof item === "string")
        : [];

      if (type === "list") {
        return items.length > 0 ? { type, items } : text ? { type: "paragraph", text } : null;
      }

      return text ? { type, text } : null;
    })
    .filter((block): block is BlogContentBlock => block !== null);

  return blocks.length > 0 || !fallbackText
    ? blocks
    : [{ type: "paragraph", text: fallbackText }];
}

export function normalizeBlogSlug(value: string): string {
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

function normalizeBlogPost(value: unknown, index: number, usedIds: Set<string>, usedSlugs: Set<string>): BlogPost | null {
  if (!isRecord(value)) return null;

  const rawTitle = typeof value.title === "string" ? value.title.trim() : "";
  const rawSlug = typeof value.slug === "string" ? value.slug : "";
  if (!rawTitle && !rawSlug) return null;

  const title = rawTitle || "Untitled Article";
  const slugSeed = normalizeBlogSlug(rawSlug || title);
  if (!slugSeed) return null;

  const slug = getUniqueValue(slugSeed, `article-${index + 1}`, usedSlugs);
  const id = getUniqueValue(value.id, `blog-${slug}`, usedIds);
  const excerpt = typeof value.excerpt === "string" ? value.excerpt.trim() : "";
  const serviceSlug = typeof value.serviceSlug === "string" ? value.serviceSlug : "";
  const date = typeof value.date === "string" ? value.date.trim() : "";
  const readTime = typeof value.readTime === "string" && value.readTime.trim() ? value.readTime.trim() : "5 min read";
  const author = typeof value.author === "string" && value.author.trim() ? value.author.trim() : "RaahX Team";
  const image = typeof value.image === "string" ? value.image.trim() : "";
  const legacySlugs = Array.isArray(value.legacySlugs)
    ? value.legacySlugs
        .filter((legacySlug): legacySlug is string => typeof legacySlug === "string")
        .map(normalizeBlogSlug)
        .filter((legacySlug) => legacySlug && legacySlug !== slug)
    : [];

  return {
    ...value,
    id,
    slug,
    title,
    excerpt,
    serviceSlug,
    date,
    readTime,
    author,
    content: normalizeContent(value.content, excerpt),
    image: image || undefined,
    legacySlugs: legacySlugs.length > 0 ? legacySlugs : undefined,
  } as BlogPost;
}

function createDefaultBlogs(): BlogPost[] {
  return blogsData.map((post: StaticBlogPost) => ({
    ...post,
    id: `blog-${post.slug}`,
    content: normalizeContent(post.content, post.excerpt),
  }));
}

export const initialBlogs: BlogPost[] = createDefaultBlogs();

export function normalizeBlogPosts(value: unknown): BlogPost[] {
  if (!Array.isArray(value)) {
    return clonePosts(initialBlogs);
  }

  const usedIds = new Set<string>();
  const usedSlugs = new Set<string>();
  const normalized = value
    .map((post, index) => normalizeBlogPost(post, index, usedIds, usedSlugs))
    .filter((post): post is BlogPost => post !== null);

  return value.length > 0 && normalized.length === 0 ? clonePosts(initialBlogs) : normalized;
}

function mergeLegacyDefaults(posts: BlogPost[]): BlogPost[] {
  const remaining = [...posts];
  const merged = initialBlogs.map((defaultPost) => {
    const existingIndex = remaining.findIndex((post) =>
      post.slug === defaultPost.slug || post.legacySlugs?.includes(defaultPost.slug),
    );

    if (existingIndex === -1) return { ...defaultPost, content: cloneContent(defaultPost.content) };

    const [existing] = remaining.splice(existingIndex, 1);
    return existing;
  });

  // Custom or newly created posts retain their stored order after the original articles.
  return [...merged, ...remaining];
}

export function getStoredPosts(options: { persist?: boolean } = {}): BlogPost[] {
  const persist = options.persist !== false;

  try {
    const saved = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!saved) {
      return clonePosts(initialBlogs);
    }

    const parsed: unknown = JSON.parse(saved);
    let normalized = normalizeBlogPosts(parsed);
    const migrationComplete = localStorage.getItem(BLOG_MIGRATION_KEY) === "true";

    // The previous admin store could contain only the first seed article. Merge
    // missing original articles once so existing public URLs/content remain available.
    if (!migrationComplete) {
      normalized = mergeLegacyDefaults(normalized);
      if (persist) {
        localStorage.setItem(BLOG_MIGRATION_KEY, "true");
      }
    }

    const normalizedJson = JSON.stringify(normalized);
    if (persist && normalizedJson !== saved) {
      localStorage.setItem(BLOG_STORAGE_KEY, normalizedJson);
    }

    return normalized;
  } catch {
    // Bad JSON or unavailable storage must never blank the public Blog pages.
    return clonePosts(initialBlogs);
  }
}

export function savePosts(posts: BlogPost[]): BlogPost[] {
  const normalized = normalizeBlogPosts(posts);

  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(BLOG_MIGRATION_KEY, "true");
  } catch {
    // Keep the admin UI usable if browser storage is unavailable.
  }

  return normalized;
}

export function getBlogBySlug(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug || post.legacySlugs?.includes(slug));
}

export class BlogApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "BlogApiError";
  }
}

function formatApiDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(value.trim())) return value.trim();

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value.trim();
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function toApiDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function blogApiErrorMessage(error: unknown): string {
  if (error instanceof BlogApiError) {
    if (error.status === 401 || error.status === 403) return "The PHP API session is not authenticated. Sign in again before changing Blog data.";
    return error.message;
  }
  return "The Blog API is unavailable.";
}

async function blogApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    throw new BlogApiError(0, "NETWORK_ERROR", "The Blog API could not be reached.");
  }

  const payload = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok || !payload?.success) {
    throw new BlogApiError(
      response.status,
      payload?.error?.code ?? "API_ERROR",
      payload?.error?.message ?? "The Blog API returned an error.",
    );
  }

  return payload.data as T;
}

function apiBlogToRecord(value: unknown): BlogPost | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const mapped = {
    ...raw,
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    serviceSlug: raw.service_slug ?? raw.serviceSlug ?? "",
    author: raw.author,
    date: formatApiDate(raw.published_at ?? raw.date),
    readTime: raw.read_time ?? raw.readTime ?? "5 min read",
    excerpt: raw.excerpt,
    image: raw.custom_image_url ?? raw.image ?? undefined,
    legacySlugs: raw.legacy_slugs ?? raw.legacySlugs ?? [],
    content: raw.content ?? raw.content_blocks ?? [],
  };
  return normalizeBlogPosts([mapped])[0] ?? null;
}

function blogRecordToApiPayload(post: BlogPost, displayOrder?: number): Record<string, unknown> {
  return {
    ...(post.id ? { id: post.id } : {}),
    title: post.title,
    slug: post.slug,
    service_slug: post.serviceSlug,
    author: post.author,
    published_at: toApiDate(post.date),
    read_time: post.readTime,
    excerpt: post.excerpt,
    custom_image_url: post.image || null,
    display_order: displayOrder ?? (typeof post.display_order === "number" ? post.display_order : 0),
    content: post.content.map((block, index) => ({ ...block, display_order: index })),
    legacy_slugs: post.legacySlugs ?? [],
  };
}

export async function fetchBlogsFromApi(): Promise<BlogPost[]> {
  const data = await blogApiRequest<unknown[]>("/blogs");
  if (!Array.isArray(data)) {
    throw new BlogApiError(502, "INVALID_API_RESPONSE", "The Blog API returned invalid data.");
  }

  return normalizeBlogPosts(data.map(apiBlogToRecord).filter((post): post is BlogPost => post !== null));
}

export async function fetchBlogByIdFromApi(id: string): Promise<BlogPost> {
  const data = await blogApiRequest<unknown>(`/blogs/${encodeURIComponent(id)}`);
  const post = apiBlogToRecord(data);
  if (!post) throw new BlogApiError(502, "INVALID_API_RESPONSE", "The Blog API returned an invalid blog.");
  return post;
}

export async function fetchBlogBySlugFromApi(slug: string): Promise<BlogPost> {
  const data = await blogApiRequest<unknown>(`/blogs/slug/${encodeURIComponent(slug)}`);
  const post = apiBlogToRecord(data);
  if (!post) throw new BlogApiError(502, "INVALID_API_RESPONSE", "The Blog API returned an invalid blog.");
  return post;
}

export async function createBlogViaApi(post: BlogPost, displayOrder?: number): Promise<BlogPost> {
  const data = await blogApiRequest<unknown>("/blogs", {
    method: "POST",
    body: JSON.stringify(blogRecordToApiPayload(post, displayOrder)),
  });
  const created = apiBlogToRecord(data);
  if (!created) throw new BlogApiError(502, "INVALID_API_RESPONSE", "The Blog API returned an invalid blog.");
  return created;
}

export async function updateBlogViaApi(id: string, post: BlogPost, displayOrder?: number): Promise<BlogPost> {
  const data = await blogApiRequest<unknown>(`/blogs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(blogRecordToApiPayload({ ...post, id }, displayOrder)),
  });
  const updated = apiBlogToRecord(data);
  if (!updated) throw new BlogApiError(502, "INVALID_API_RESPONSE", "The Blog API returned an invalid blog.");
  return updated;
}

export async function deleteBlogViaApi(id: string): Promise<void> {
  await blogApiRequest<{ deleted: boolean }>(`/blogs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export { blogApiErrorMessage, isServiceApiConfigured as isBlogApiConfigured };
