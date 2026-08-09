import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { getInitials } from "../data/blogsData";
import { getStoredServices } from "../services/serviceStore";
import {
  fetchBlogsFromApi,
  getStoredPosts,
  isBlogApiConfigured,
  type BlogPost,
} from "../services/blogStore";
import type { ServiceData } from "../data/servicesData";
import { getServiceIcon } from "../utils/getServiceIcon";

function getService(serviceSlug: string, services: ServiceData[]): ServiceData | undefined {
  return services.find((service) => service.slug === serviceSlug);
}

function CoverArt({
  Icon,
  image,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  image?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  if (image && !imageFailed) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-secondary">
        <img
          src={image}
          alt=""
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-secondary via-secondary to-primary/60 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <Icon size={120} strokeWidth={1} className="absolute -right-6 -bottom-6 text-white/10" />
    </div>
  );
}

interface PopularEntry {
  slug: string;
  views: number;
}

export default function BlogIndex() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [popular, setPopular] = useState<PopularEntry[]>([]);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredPosts());
  const [services, setServices] = useState<ServiceData[]>(() => getStoredServices());

  useEffect(() => {
    let isMounted = true;
    const fallbackPosts = getStoredPosts();
    setPosts(fallbackPosts);
    setServices(getStoredServices());

    if (!isBlogApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchBlogsFromApi()
      .then((remotePosts) => {
        if (isMounted && (remotePosts.length > 0 || fallbackPosts.length === 0)) {
          setPosts(remotePosts);
        }
      })
      .catch((error) => {
        console.warn("Blog API unavailable; using the local Blog fallback.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;

    setSubscribeStatus("loading");
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail.trim() }),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      setSubscribeStatus("success");
      setSubscribeEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 4000);
    } catch {
      setSubscribeStatus("error");
      setTimeout(() => setSubscribeStatus("idle"), 4000);
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      counts.set(post.serviceSlug, (counts.get(post.serviceSlug) ?? 0) + 1);
    });
    return services
      .map((service) => ({ service, count: counts.get(service.slug) ?? 0 }))
      .filter((entry) => entry.count > 0);
  }, [posts, services]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesService = !activeService || post.serviceSlug === activeService;
      if (!matchesService) return false;
      if (!query.trim()) return true;
      const service = getService(post.serviceSlug, services);
      const haystack = `${post.title} ${post.excerpt} ${service?.name ?? ""}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [activeService, posts, query, services]);

  useEffect(() => {
    fetch("/api/blog-views/popular?limit=3")
      .then((res) => res.json())
      .then((data) => setPopular(data.posts ?? []))
      .catch(() => setPopular([]));
  }, []);

  const popularPosts: BlogPost[] = popular
    .map((entry) => posts.find((post) => post.slug === entry.slug || post.legacySlugs?.includes(entry.slug)))
    .filter((p): p is BlogPost => Boolean(p));

  return (
    <div className="min-h-screen bg-background text-body font-body">
      <div className="pt-32 md:pt-36 bg-white">
        {/* Filter bar + search */}
        <section className="py-6 border-b border-gray-100 bg-white sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 min-w-0" style={{ scrollbarWidth: "thin" }}>
              <button
                onClick={() => setActiveService(null)}
                className={`shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  activeService === null
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
                }`}
              >
                All Posts
              </button>
              {services.map((service) => (
                <button
                  key={service.slug}
                  onClick={() => setActiveService(service.slug)}
                  className={`shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    activeService === service.slug
                      ? "bg-secondary text-white border-secondary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72 shrink-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Content: posts grid + sidebar */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          {/* Posts grid */}
          <div>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                No articles match your filters yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => {
                  const service = getService(post.serviceSlug, services);
                  return (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative h-44">
                        <CoverArt
                          Icon={service ? getServiceIcon(service.icon) : (() => null)}
                          image={post.image}
                        />
                        {service && (
                          <span className="absolute top-4 left-4 inline-block text-xs font-semibold text-secondary bg-white px-3 py-1 rounded-full shadow-sm">
                            {service.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-6">
                        <span className="text-xs text-gray-400 mb-2">
                          {post.date} &nbsp;·&nbsp; {post.readTime}
                        </span>
                        <h2 className="text-lg font-heading font-semibold text-secondary mb-2 leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                          {post.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm">
                          Read More <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-heading font-bold text-secondary text-base mb-5">Categories</h3>
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {categoryCounts.map(({ service, count }) => {
                  const Icon = getServiceIcon(service.icon);
                  return (
                    <li key={service.slug}>
                      <button
                        onClick={() => setActiveService(service.slug)}
                        className="w-full flex items-start justify-between gap-3 text-sm text-gray-600 hover:text-primary transition-colors text-left"
                      >
                        <span className="flex items-start gap-2 min-w-0">
                          <Icon size={15} className="text-primary shrink-0 mt-0.5" />
                          <span className="min-w-0">{service.name}</span>
                        </span>
                        <span className="text-gray-400 shrink-0">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Popular Posts */}
            {popularPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-heading font-bold text-secondary text-base mb-5">Popular Posts</h3>
                <ul className="space-y-4">
                  {popularPosts.map((post, i) => {
                    const service = getService(post.serviceSlug, services);
                    return (
                      <li key={post.slug}>
                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-3 group">
                          <span className="text-xs font-heading font-bold text-primary shrink-0 w-5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <CoverArt
                              Icon={service ? getServiceIcon(service.icon) : (() => null)}
                              image={post.image}
                            />
                          </div>
                          <span className="text-sm font-medium text-secondary leading-snug group-hover:text-primary transition-colors">
                            {post.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Bottom CTA (Subscribe Bar) */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
            style={{ backgroundColor: "#0D2B24" }}
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Mail size={24} className="text-white" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
                Don't Miss Valuable Insights
              </h2>
              <p className="text-gray-400 text-sm">
                Subscribe to our newsletter and get notified whenever we publish a new blog post.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <input
                  type="email"
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-64 px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder:text-gray-400 outline-none focus:border-primary/60"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === "loading"}
                  className="w-full sm:w-auto whitespace-nowrap inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#14B8A6" }}
                >
                  {subscribeStatus === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {subscribeStatus === "success" && (
                <p className="mt-2 text-xs text-emerald-400 flex items-center justify-center md:justify-start gap-1">
                  <CheckCircle size={14} /> Subscribed successfully!
                </p>
              )}
              {subscribeStatus === "error" && (
                <p className="mt-2 text-xs text-rose-400 flex items-center justify-center md:justify-start gap-1">
                  <AlertCircle size={14} /> Something went wrong. Try again.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}