import { LucideProps } from "lucide-react";
import { servicesData, type ServiceData } from "../data/servicesData";

export interface BlogContentBlock {
  type: "paragraph" | "heading" | "quote" | "list";
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
}

const STORAGE_KEY = "raahx_blog_posts";

export const initialBlogs: BlogPost[] = [
  {
    id: "1",
    slug: "seo-fundamentals-2026",
    title: "SEO in 2026: What Actually Moves the Needle Now",
    excerpt: "Search has changed more in the last two years than in the decade before it. Here's what's still worth your time, and what to drop.",
    serviceSlug: "seo-services",
    date: "Jul 22, 2026",
    readTime: "6 min read",
    author: "RaahX Team",
    content: [
      { type: "paragraph", text: "Search engines don't just index pages anymore, they interpret intent." },
      { type: "heading", text: "Content depth beats content volume" },
      { type: "paragraph", text: "Publishing more thin articles used to work. It doesn't anymore." }
    ]
  }
];

export const getStoredPosts = (): BlogPost[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBlogs));
    return initialBlogs;
  }
  return JSON.parse(data);
};

export const savePosts = (posts: BlogPost[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getServiceBySlug = (serviceSlug: string): ServiceData | undefined => {
  return servicesData.find((s) => s.slug === serviceSlug);
};

export const getInitials = (name: string): string => {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};