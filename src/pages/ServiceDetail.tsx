import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { servicesData as staticServices, ServiceData } from "../data/servicesData";
import {
  fetchServicesFromApi,
  getStoredServices,
  isServiceApiConfigured,
  type ServiceRecord,
} from "../services/serviceStore";
import { getServiceIcon } from "../utils/getServiceIcon";

export default function ServiceDetail() {
  const { slug } = useParams();
  const [services, setServices] = useState<ServiceRecord[]>(staticServices);

  useEffect(() => {
    let isMounted = true;
    const fallbackServices = getStoredServices();
    setServices(fallbackServices);

    if (!isServiceApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchServicesFromApi()
      .then((remoteServices) => {
        if (isMounted && (remoteServices.length > 0 || fallbackServices.length === 0)) {
          setServices(remoteServices);
        }
      })
      .catch((error) => {
        console.warn("Services API unavailable; using the local service fallback.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-4">
          Service not found
        </h1>
        <Link to="/" className="text-primary font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  const Icon = getServiceIcon(service.icon);

  return (
    <div className="min-h-screen bg-background text-body font-body">
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 bg-gradient-to-b from-primary/5 via-surface to-background overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <Link
            to="/#services"
            className="inline-flex items-center gap-2 text-sm font-medium font-body text-body bg-white px-4 py-2 rounded-full border border-border hover:border-primary/40 hover:text-primary hover:shadow-md transition-all duration-300 mb-8 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Services
          </Link>

          <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-lg border border-primary/10 flex items-center justify-center text-primary mb-6 transition-transform hover:scale-105 duration-300">
            <Icon size={38} strokeWidth={1.8} />
          </div>

          <h1 className="font-heading font-extrabold text-primary text-4xl md:text-6xl tracking-tight mb-4 drop-shadow-sm">
            {service.name}
          </h1>

          {service.heroTitle && (
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-primary/20 shadow-sm mb-6 max-w-2xl transition-all hover:shadow-md">
              <Sparkles
                size={20}
                className="text-primary shrink-0 animate-bounce"
              />
              <span className="font-heading font-bold text-secondary text-lg md:text-xl leading-snug">
                {service.heroTitle}
              </span>
            </div>
          )}

          {service.heroSubtitle && (
            <p className="font-body text-base md:text-lg text-body/90 max-w-2xl mx-auto leading-relaxed font-normal">
              {service.heroSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {service.stats && service.stats.length > 0 && (
        <section className="py-12 bg-secondary">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 grid grid-cols-3 gap-6 text-center">
            {service.stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="font-body text-base text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Overview Section */}
      {service.overview && (
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <p className="font-body text-lg text-body leading-relaxed">
              {service.overview}
            </p>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      {(service.whyChooseTitle || service.whyChooseText) && (
        <section className="py-20 bg-surface">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            {service.whyChooseTitle && (
              <h2 className="font-heading font-bold text-secondary text-3xl md:text-[42px] md:leading-tight mb-6">
                {service.whyChooseTitle}
              </h2>
            )}
            {service.whyChooseText && (
              <p className="font-body text-lg text-body leading-relaxed text-left">
                {service.whyChooseText}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Process Section */}
      {service.process && service.process.length > 0 && (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="font-heading font-bold text-secondary text-3xl md:text-[42px] mb-12 text-center">
              How We Make It Happen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.process.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 bg-white rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary font-heading font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-secondary text-2xl mb-1">
                      {step.title}
                    </h3>
                    <p className="font-body text-base text-body">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {service.benefits && service.benefits.length > 0 && (
        <section className="py-20 bg-surface">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="font-heading font-bold text-secondary text-3xl md:text-[42px] mb-12 text-center">
              Your Unfair Advantage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {service.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <CheckCircle2 size={28} className="text-primary" />
                  <h3 className="font-heading font-semibold text-secondary text-xl">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-sm text-body">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial Section */}
      {service.testimonial?.quote && (
        <section className="py-20 bg-secondary text-white">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center space-y-4">
            <blockquote className="font-heading text-xl md:text-2xl italic font-light leading-relaxed">
              "{service.testimonial.quote}"
            </blockquote>
            {service.testimonial.author && (
              <p className="text-primary font-semibold text-base">
                — {service.testimonial.author}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Proposal Banner CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-[#081B17] to-secondary text-white border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl tracking-tight text-white">
            Ready to Scale Your Brand with {service.name}?
          </h2>

          <p className="font-body text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Get a customized, data-driven roadmap tailored specifically to your business goals. No commitments, completely free.
          </p>

          <div className="pt-4">
            <Link
              to="/proposal"
              className="inline-flex items-center gap-3 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-heading font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              Get Your Free Proposal
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}