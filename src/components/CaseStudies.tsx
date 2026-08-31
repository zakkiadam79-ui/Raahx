import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  fetchCaseStudiesFromApi,
  getStoredCaseStudies,
  isCaseStudyApiConfigured,
  type CaseStudyRecord,
} from "../services/caseStudyStore";

const homepageCaseContent: Record<string, Pick<CaseStudyRecord, "challenge" | "solution" | "metrics">> = {
  "ecommerce-brand": {
    challenge: "High customer acquisition costs, inconsistent sales, and low customer retention in a competitive eCommerce market.",
    solution: "We combined performance marketing, conversion optimization, audience insights, and automated customer journeys to improve acquisition efficiency and increase repeat purchases.",
    metrics: [{ value: "346%", label: "ROAS" }, { value: "7.5X", label: "Revenue Growth" }, { value: "42%", label: "CPA Reduction" }],
  },
  "b2b-saas-platform": {
    challenge: "The company needed a stronger lead-generation system and greater visibility among enterprise decision-makers.",
    solution: "We developed a targeted B2B growth strategy combining SEO, LinkedIn campaigns, account-based marketing, and high-value content designed to attract qualified prospects.",
    metrics: [{ value: "22K", label: "MQLs" }, { value: "139%", label: "Conversion Growth" }, { value: "4.2M", label: "Pipeline Generated" }],
  },
};

export default function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState<CaseStudyRecord[]>(() => getStoredCaseStudies());

  useEffect(() => {
    let isMounted = true;
    const fallbackStudies = getStoredCaseStudies();

    if (!isCaseStudyApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchCaseStudiesFromApi()
      .then((remoteStudies) => {
        if (isMounted && (remoteStudies.length > 0 || fallbackStudies.length === 0)) {
          setCaseStudies(remoteStudies);
        }
      })
      .catch((error) => {
        console.warn("Case Study API unavailable; using the local fallback.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="case-studies" className="py-24 bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Real Strategies. Measurable Results.
            </h2>
            <p className="text-gray-400">
              See how strategic digital marketing, technology, and data-driven campaigns can turn business challenges into measurable growth opportunities.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {caseStudies.map((record) => {
            const study = { ...record, ...(homepageCaseContent[record.slug] ?? {}) };
            return <div key={study.id} className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-between">
              <div>
                <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row">
                  <h3 className="text-2xl font-heading font-semibold text-teal-300">{study.client}</h3>
                  <Link
                    to={`/case-studies/${study.slug}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary"
                    aria-label={`View ${study.client} case study`}
                  >
                    <span>View Case Study</span><ArrowUpRight size={18} />
                  </Link>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Challenge</h4>
                    <p className="text-gray-300 leading-relaxed">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Solution</h4>
                    <p className="text-gray-300 leading-relaxed">{study.solution}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                {study.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex}>
                    <div className="text-2xl md:text-3xl font-heading font-bold text-white mb-1">{metric.value}</div>
                    <div className="text-xs md:text-sm text-gray-400">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>;
          })}
        </div>
      </div>
    </section>
  );
}
