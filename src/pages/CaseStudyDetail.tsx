import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";
import { getCaseStudyBySlug, getStoredCaseStudies, type CaseStudyRecord } from "../services/caseStudyStore";

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [caseStudies] = useState<CaseStudyRecord[]>(() => getStoredCaseStudies());
  const study = slug ? getCaseStudyBySlug(caseStudies, slug) : undefined;

  if (!study) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-4">Case study not found</h1>
        <Link to="/" className="text-primary font-medium">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-body font-body">
      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Link
            to="/#case-studies"
            className="inline-flex items-center gap-2 text-sm font-medium text-body bg-white px-4 py-2 rounded-full border border-border hover:border-primary/30 hover:text-primary shadow-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Case Studies
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-primary text-sm font-medium mb-6">
            <TrendingUp size={14} />
            {study.industry}
          </div>

          <h1 className="font-heading font-bold text-secondary text-4xl md:text-6xl mb-6">
            {study.client}
          </h1>
          <p className="font-body text-lg text-body max-w-2xl mx-auto leading-relaxed">
            {study.overview}
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 bg-secondary">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 grid grid-cols-3 gap-6 text-center">
          {study.metrics.map((metric, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-1">{metric.value}</div>
              <div className="font-body text-base text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge & Solution */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-heading font-bold text-secondary text-2xl mb-3">The Challenge</h2>
            <p className="font-body text-body leading-relaxed">{study.challenge}</p>
          </div>
          <div>
            <h2 className="font-heading font-bold text-secondary text-2xl mb-3">The Solution</h2>
            <p className="font-body text-body leading-relaxed">{study.solution}</p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="font-heading font-bold text-secondary text-3xl md:text-[42px] mb-12 text-center">
            Our Approach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {study.approach.map((step, index) => (
              <div key={index} className="flex gap-4 p-6 bg-white rounded-2xl border border-border">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary font-heading font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-secondary text-xl mb-1">{step.title}</h3>
                  <p className="font-body text-base text-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-primary text-xl mb-4">★★★★★</div>
          <p className="font-body text-lg text-secondary italic mb-4">"{study.testimonial.quote}"</p>
          <p className="font-heading font-semibold text-secondary">— {study.testimonial.author}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-center">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <h2 className="font-heading font-bold text-white text-3xl md:text-[42px] mb-4">
            Ready for Results Like This?
          </h2>
          <p className="font-body text-lg text-gray-400 mb-8">
            Let's build a growth strategy tailored to your business, just like we did here.
          </p>
          <Link
            to="/proposal"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-heading font-semibold text-lg px-8 py-4 rounded-full transition-colors"
          >
            Get Your Free Proposal <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
