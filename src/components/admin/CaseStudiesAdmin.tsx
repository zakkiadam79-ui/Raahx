import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { defaultCaseStudies, CaseStudyData } from "../../data/caseStudiesData";

const STORAGE_KEY = "raahx_casestudies_data";

export default function CaseStudiesAdmin() {
  const [studies, setStudies] = useState<CaseStudyData[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form Fields
  const [slug, setSlug] = useState("");
  const [client, setClient] = useState("");
  const [industry, setIndustry] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [overview, setOverview] = useState("");

  // Helper string fields (Format: Title | Description or Label | Value)
  const [approachRaw, setApproachRaw] = useState("");
  const [metricsRaw, setMetricsRaw] = useState("");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setStudies(JSON.parse(saved));
    } else {
      setStudies(defaultCaseStudies);
    }
  }, []);

  const saveToStorage = (updated: CaseStudyData[]) => {
    setStudies(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !slug) return;

    const parsedApproach = approachRaw
      .split("\n")
      .map((line) => {
        const [title, description] = line.split("|");
        return { title: title?.trim() || "", description: description?.trim() || "" };
      })
      .filter((a) => a.title);

    const parsedMetrics = metricsRaw
      .split("\n")
      .map((line) => {
        const [label, value] = line.split("|");
        return { label: label?.trim() || "", value: value?.trim() || "" };
      })
      .filter((m) => m.label && m.value);

    const studyObj: CaseStudyData = {
      slug,
      client,
      industry,
      challenge,
      solution,
      overview,
      approach: parsedApproach,
      metrics: parsedMetrics,
      testimonial: { quote, author },
    };

    if (isEditing) {
      const updated = studies.map((s) => (s.slug === isEditing ? studyObj : s));
      saveToStorage(updated);
      setIsEditing(null);
    } else {
      saveToStorage([...studies, studyObj]);
    }

    resetForm();
  };

  const handleEdit = (study: CaseStudyData) => {
    setIsEditing(study.slug);
    setSlug(study.slug);
    setClient(study.client);
    setIndustry(study.industry || "");
    setChallenge(study.challenge || "");
    setSolution(study.solution || "");
    setOverview(study.overview || "");

    setApproachRaw(study.approach?.map((a) => `${a.title} | ${a.description}`).join("\n") || "");
    setMetricsRaw(study.metrics?.map((m) => `${m.label} | ${m.value}`).join("\n") || "");

    setQuote(study.testimonial?.quote || "");
    setAuthor(study.testimonial?.author || "");
  };

  const handleDelete = (slugToDelete: string) => {
    if (confirm("Are you sure you want to delete this case study?")) {
      const updated = studies.filter((s) => s.slug !== slugToDelete);
      saveToStorage(updated);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setSlug("");
    setClient("");
    setIndustry("");
    setChallenge("");
    setSolution("");
    setOverview("");
    setApproachRaw("");
    setMetricsRaw("");
    setQuote("");
    setAuthor("");
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddOrUpdate} className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">
          {isEditing ? "Edit Case Study" : "Add New Case Study"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Client Name</label>
            <input
              type="text"
              placeholder="e.g. E-Commerce Brand"
              value={client}
              onChange={(e) => {
                setClient(e.target.value);
                if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">URL Slug</label>
            <input
              type="text"
              placeholder="e.g. ecommerce-brand"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Industry Tag</label>
            <input
              type="text"
              placeholder="e.g. E-Commerce"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Challenge Summary</label>
            <textarea
              placeholder="Struggling with high customer acquisition costs..."
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Solution Summary</label>
            <textarea
              placeholder="Implemented an AI-driven predictive bidding strategy..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Full Detail Page Overview</label>
          <textarea
            placeholder="This e-commerce brand was spending heavily on ads..."
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Approach Steps (Title | Description per line)</label>
            <textarea
              placeholder={"Audit & Diagnosis | We analyzed campaign performance...\nPredictive Bidding | We deployed AI-driven bidding..."}
              value={approachRaw}
              onChange={(e) => setApproachRaw(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Metrics Cards (Label | Value per line)</label>
            <textarea
              placeholder={"ROAS | 346%\nRevenue | 7.5X\nCPA Reduction | 42%"}
              value={metricsRaw}
              onChange={(e) => setMetricsRaw(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Testimonial Quote</label>
            <input
              type="text"
              placeholder='e.g. "RaahX didn&#39;t just lower our ad costs..."'
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Testimonial Author</label>
            <input
              type="text"
              placeholder="e.g. E-Commerce Client"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold rounded-xl transition-all text-sm"
          >
            {isEditing ? <Check size={16} /> : <Plus size={16} />}
            {isEditing ? "Update Case Study" : "Add Case Study"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl transition-all text-sm"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {studies.map((study) => (
          <div key={study.slug} className="p-4 bg-black/20 border border-white/10 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white text-sm">{study.client}</h4>
              <p className="text-xs text-[#2DD4BF]">/case-studies/{study.slug}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(study)} className="p-2 hover:bg-white/10 text-gray-300 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(study.slug)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}