import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getStoredCaseStudies, type CaseStudyRecord } from "../services/caseStudyStore";

export default function CaseStudies() {
  const [caseStudies] = useState<CaseStudyRecord[]>(() => getStoredCaseStudies());

  return (
    <section id="case-studies" className="py-24 bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Case Studies
            </h2>
            <p className="text-gray-400">
              Real results. Discover how we've helped brands transform their digital presence and achieve unprecedented growth.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {caseStudies.map((study) => (
            <div key={study.id} className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-heading font-semibold text-teal-300">{study.client}</h3>
                  <Link
                    to={`/case-studies/${study.slug}`}
                    className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors text-white shrink-0"
                    aria-label={`View ${study.client} case study`}
                  >
                    <ArrowUpRight size={20} />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
