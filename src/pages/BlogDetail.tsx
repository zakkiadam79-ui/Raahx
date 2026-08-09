import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { getInitials } from "../data/blogsData";
import { getStoredServices } from "../services/serviceStore";
import { getBlogBySlug, getStoredPosts, type BlogPost } from "../services/blogStore";
import type { ServiceData } from "../data/servicesData";
import { getServiceIcon } from "../utils/getServiceIcon";

function getService(serviceSlug: string, services: ServiceData[]) {
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
      <div className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -right-10 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <Icon size={160} strokeWidth={1} className="absolute -right-8 -bottom-8 text-white/10" />
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredPosts());
  const [services, setServices] = useState<ServiceData[]>(() => getStoredServices());

  useEffect(() => {
    setPosts(getStoredPosts());
    setServices(getStoredServices());

    if (slug) {
      fetch(`/api/blog-views/${slug}`, { method: "POST" }).catch(() => {
        /* fail silently */
      });
    }
  }, [slug]);

  const post = slug ? getBlogBySlug(posts, slug) : undefined;

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-4">Article not found</h1>
        <Link to="/blog" className="text-primary font-medium">Back to Blog</Link>
      </div>
    );
  }

  const service = getService(post.serviceSlug, services);
  const morePosts = posts.filter((item) => item.id !== post.id).slice(0, 3);
  const contentBlocks = Array.isArray(post.content) ? post.content : [];

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
            <CoverArt
              Icon={service ? getServiceIcon(service.icon) : (() => null)}
              image={post.image}
            />
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

              if (block.type === "list") {
                return (
                  <ul key={i} className="list-disc space-y-2 pl-6 font-body text-lg text-body leading-relaxed">
                    {(block.items ?? []).map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                  </ul>
                );
              }

              if (block.type === "quote") {
                return (
                  <blockquote key={i} className="border-l-4 border-primary/40 pl-5 font-body text-lg italic leading-relaxed text-body">
                    {block.text}
                  </blockquote>
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
            {morePosts.map((morePost) => {
              const moreService = getService(morePost.serviceSlug, services);
              return (
                <Link
                  key={morePost.id}
                  to={`/blog/${morePost.slug}`}
                  className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-36">
                    <CoverArt
                      Icon={moreService ? getServiceIcon(moreService.icon) : (() => null)}
                      image={morePost.image}
                    />
                    {moreService && (
                      <span className="absolute top-3 left-3 inline-block text-xs font-semibold text-secondary bg-white px-2.5 py-1 rounded-full shadow-sm">
                        {moreService.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-heading font-semibold text-secondary leading-snug group-hover:text-primary transition-colors">
                      {morePost.title}
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
