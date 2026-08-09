import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, Loader2 } from "lucide-react";
import { blogsData, getBlogBySlug, getInitials, type BlogPost } from "../data/blogsData";
import { servicesData } from "../data/servicesData";
import { getServiceIcon } from "../utils/getServiceIcon";

function getService(serviceSlug: string) {
  return servicesData.find((s) => s.slug === serviceSlug);
}

function CoverArt({ Icon }: { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-secondary via-secondary to-primary/60 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -right-10 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <Icon size={160} strokeWidth={1} className="absolute -right-8 -bottom-8 text-white/10" />
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch post dynamically (Admin compatibility) with fallback to local static data
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    fetch(`/api/blogs/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Blog not found on server");
        return res.json();
      })
      .then((data) => {
        if (isSubscribed) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          // Fallback to static blogsData
          const localPost = getBlogBySlug(slug);
          setPost(localPost || null);
          setLoading(false);
        }
      });

    // Record a real view for this post
    fetch(`/api/blog-views/${slug}`, { method: "POST" }).catch(() => {
      /* fail silently */
    });

    return () => {
      isSubscribed = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-32 pb-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-4">Article not found</h1>
        <Link to="/blog" className="text-primary font-medium">Back to Blog</Link>
      </div>
    );
  }

  const service = getService(post.serviceSlug);
  const morePosts = blogsData.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Normalize content: supports structured block array or fallback string content from admin inputs
  const contentBlocks = Array.isArray(post.content)
    ? post.content
    : typeof post.content === "string"
    ? [{ type: "paragraph", text: post.content }]
    : [];

  return (
    <div className="min-h-screen bg-background text-body font-body">
      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-10 bg-gradient-to-b from-primary/5 via-surface to-background overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium font-body text-body bg-white px-4 py-2 rounded-full border border-border hover:border-primary/40 hover:text-primary hover:shadow-md transition-all duration-300 mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {service && (
            <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-5">
              {service.name}
            </span>
          )}

          <h1 className="font-heading font-extrabold text-secondary text-3xl md:text-5xl tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-heading font-semibold flex items-center justify-center text-sm shrink-0">
              {getInitials(post.author || "Admin")}
            </div>
            <div className="text-sm text-left">
              <div className="font-medium text-secondary">{post.author || "Admin"}</div>
              <div className="flex items-center gap-3 text-gray-500 text-xs mt-0.5">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover banner */}
      <section className="pb-4">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg">
            <CoverArt Icon={service ? getServiceIcon(service.icon) : (() => null)} />
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="space-y-6">
            {contentBlocks.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2 key={i} className="font-heading font-bold text-secondary text-2xl md:text-[28px] pt-4">
                    {block.text}
                  </h2>
                );
              }
              const isLead = i === 0;
              return (
                <p
                  key={i}
                  className={
                    isLead
                      ? "font-body text-xl md:text-2xl text-secondary font-medium leading-relaxed"
                      : "font-body text-lg text-body leading-relaxed"
                  }
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* More articles */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-heading font-bold text-secondary text-2xl md:text-3xl mb-10 text-center">
            More From the Blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {morePosts.map((p) => {
              const pService = getService(p.serviceSlug);
              return (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-36">
                    <CoverArt Icon={pService ? getServiceIcon(pService.icon) : (() => null)} />
                    {pService && (
                      <span className="absolute top-3 left-3 inline-block text-xs font-semibold text-secondary bg-white px-2.5 py-1 rounded-full shadow-sm">
                        {pService.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-heading font-semibold text-secondary leading-snug group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-secondary text-center">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <h2 className="font-heading font-bold text-white text-3xl md:text-[42px] mb-4">
            Ready to Dominate Your Industry?
          </h2>
          <p className="font-body text-lg text-gray-400 mb-8">
            Let RaahX turn ideas like these into a real strategy built around your business.
          </p>
          <Link
            to="/#proposal"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-heading font-semibold text-lg px-8 py-4 rounded-[14px] transition-colors shadow-lg hover:shadow-primary/20"
          >
            Claim Your Free Strategy Session <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}