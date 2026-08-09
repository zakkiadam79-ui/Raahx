import { blogsData, type BlogPost as StaticBlogPost } from "../data/blogsData";

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

export function getStoredPosts(): BlogPost[] {
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
      localStorage.setItem(BLOG_MIGRATION_KEY, "true");
    }

    const normalizedJson = JSON.stringify(normalized);
    if (normalizedJson !== saved) {
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
