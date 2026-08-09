import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getInitials } from "../data/blogsData";
import { getStoredServices } from "../services/serviceStore";
import { getStoredPosts, type BlogPost } from "../services/blogStore";
import { getServiceIcon } from "../utils/getServiceIcon";
import type { ServiceData } from "../data/servicesData";

function getService(serviceSlug: string, services: ServiceData[]) {
  return services.find((service) => service.slug === serviceSlug);
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
      <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <Icon size={140} strokeWidth={1} className="absolute -right-6 -bottom-6 text-white/10" />
    </div>
  );
}

export default function Blog() {
  const [posts] = useState<BlogPost[]>(() => getStoredPosts());
  const [services] = useState<ServiceData[]>(() => getStoredServices());
  const [featured, ...rest] = posts;
  const secondary = rest.slice(0, 2);

  if (!featured) {
    return (
      <section id="blog" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">From the Blog</h2>
          <p className="text-gray-600">New insights are being prepared. Check back soon.</p>
        </div>
      </section>
    );
  }

  const featuredService = getService(featured.serviceSlug, services);

  return (
    <section id="blog" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Insights
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">
            From the Blog
          </h2>
          <p className="text-gray-600">
            Practical thinking on marketing, design, and growth — straight from the team behind your campaigns.
          </p>
        </div>

        {/* Featured post */}
        <Link
          to={`/blog/${featured.slug}`}
          className="group grid md:grid-cols-2 gap-0 bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 mb-8"
        >
          <div className="relative h-56 md:h-auto">
            <CoverArt Icon={featuredService ? getServiceIcon(featuredService.icon) : (() => null)} />
            {featuredService && (
              <span className="absolute top-5 left-5 inline-block text-xs font-semibold text-secondary bg-white px-3 py-1.5 rounded-full shadow-sm">
                {featuredService.name}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
              Latest Article
            </span>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-3 leading-snug group-hover:text-primary transition-colors">
              {featured.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-heading font-semibold flex items-center justify-center text-sm shrink-0">
                {getInitials(featured.author)}
              </div>
              <div className="text-sm">
                <div className="font-medium text-secondary">{featured.author}</div>
                <div className="text-gray-400 text-xs">{featured.date} · {featured.readTime}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm">
              Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Secondary posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {secondary.map((post) => {
            const service = getService(post.serviceSlug, services);
            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-40">
                  <CoverArt Icon={service ? getServiceIcon(service.icon) : (() => null)} />
                  {service && (
                    <span className="absolute top-4 left-4 inline-block text-xs font-semibold text-secondary bg-white px-3 py-1 rounded-full shadow-sm">
                      {service.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-lg font-heading font-semibold text-secondary mb-2 leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2.5 pt-4 border-t border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-heading font-semibold flex items-center justify-center text-xs shrink-0">
                      {getInitials(post.author)}
                    </div>
                    <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-secondary bg-white border border-gray-200 rounded-full hover:border-primary/40 hover:text-primary transition-colors shadow-sm"
          >
            View All Articles <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
