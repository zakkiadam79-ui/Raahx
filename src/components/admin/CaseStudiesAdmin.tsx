import React, { useEffect, useState } from "react";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import type { ApproachStep, Metric } from "../../data/caseStudiesData";
import {
  caseStudyApiErrorMessage,
  CaseStudyApiError,
  createCaseStudyViaApi,
  deleteCaseStudyViaApi,
  fetchCaseStudiesFromApi,
  getStoredCaseStudies,
  isCaseStudyApiConfigured,
  normalizeCaseStudySlug,
  saveCaseStudies,
  type CaseStudyRecord,
  updateCaseStudyViaApi,
} from "../../services/caseStudyStore";

const fieldClassName =
  "w-full rounded-xl border border-white/20 bg-[#071B17] px-4 py-3 text-sm text-white placeholder:text-gray-400 shadow-inner outline-none transition focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/30";
const labelClassName = "block text-sm font-semibold text-gray-100";
const helpTextClassName = "mt-1.5 text-xs leading-relaxed text-gray-300";
const sectionClassName = "rounded-2xl border border-white/15 bg-[#102C25]/80 p-5 md:p-6 space-y-5";

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className="border-b border-white/15 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#7FF5DE]">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">{description}</p>
      </div>
      {children}
    </section>
  );
}

const emptyApproachStep = (): ApproachStep => ({ title: "", description: "" });
const emptyMetric = (): Metric => ({ label: "", value: "" });

export default function CaseStudiesAdmin() {
  const [studies, setStudies] = useState<CaseStudyRecord[]>(() => getStoredCaseStudies());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [slug, setSlug] = useState("");
  const [client, setClient] = useState("");
  const [industry, setIndustry] = useState("");
  const [overview, setOverview] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [approach, setApproach] = useState<ApproachStep[]>([emptyApproachStep()]);
  const [metrics, setMetrics] = useState<Metric[]>([emptyMetric()]);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fallbackStudies = getStoredCaseStudies();
    setStudies(fallbackStudies);

    if (!isCaseStudyApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchCaseStudiesFromApi()
      .then((remoteStudies) => {
        if (isMounted) setStudies(remoteStudies);
      })
      .catch((error) => {
        if (isMounted) setApiError(caseStudyApiErrorMessage(error));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setSlug("");
    setClient("");
    setIndustry("");
    setOverview("");
    setChallenge("");
    setSolution("");
    setApproach([emptyApproachStep()]);
    setMetrics([emptyMetric()]);
    setQuote("");
    setAuthor("");
    setSlugManuallyEdited(false);
    setFormError("");
    setApiError("");
  };

  const startNewStudy = () => {
    clearForm();
  };

  const startEdit = (study: CaseStudyRecord) => {
    setEditingId(study.id);
    setSlug(study.slug);
    setClient(study.client);
    setIndustry(study.industry || "");
    setOverview(study.overview || "");
    setChallenge(study.challenge || "");
    setSolution(study.solution || "");
    setApproach(study.approach.length > 0 ? study.approach.map((step) => ({ ...step })) : [emptyApproachStep()]);
    setMetrics(study.metrics.length > 0 ? study.metrics.map((metric) => ({ ...metric })) : [emptyMetric()]);
    setQuote(study.testimonial?.quote || "");
    setAuthor(study.testimonial?.author || "");
    setSlugManuallyEdited(true);
    setFormError("");
  };

  const updateApproach = (index: number, changes: Partial<ApproachStep>) => {
    setApproach((current) => current.map((step, stepIndex) => (
      stepIndex === index ? { ...step, ...changes } : step
    )));
    setFormError("");
  };

  const updateMetric = (index: number, changes: Partial<Metric>) => {
    setMetrics((current) => current.map((metric, metricIndex) => (
      metricIndex === index ? { ...metric, ...changes } : metric
    )));
    setFormError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedSlug = normalizeCaseStudySlug(slug || client);
    const cleanApproach = approach
      .map((step) => ({ title: step.title.trim(), description: step.description.trim() }))
      .filter((step) => step.title || step.description);
    const cleanMetrics = metrics
      .map((metric) => ({ label: metric.label.trim(), value: metric.value.trim() }))
      .filter((metric) => metric.label || metric.value);

    if (!client.trim()) {
      setFormError("Project / client name is required.");
      return;
    }
    if (!normalizedSlug) {
      setFormError("URL slug is required and must contain letters or numbers.");
      return;
    }
    if (!industry.trim()) {
      setFormError("Industry is required because it appears in the public Case Study detail page.");
      return;
    }
    if (!overview.trim()) {
      setFormError("Project overview is required for the public Case Study detail page.");
      return;
    }
    if (!challenge.trim()) {
      setFormError("Challenge description is required.");
      return;
    }
    if (!solution.trim()) {
      setFormError("Solution description is required.");
      return;
    }
    if (approach.some((step) => Boolean(step.title.trim()) !== Boolean(step.description.trim()))) {
      setFormError("Complete both the title and description for each approach step, or remove the empty step.");
      return;
    }
    if (cleanApproach.length === 0) {
      setFormError("Add at least one complete approach step.");
      return;
    }
    if (metrics.some((metric) => Boolean(metric.label.trim()) !== Boolean(metric.value.trim()))) {
      setFormError("Complete both the label and value for each result metric, or remove the empty metric.");
      return;
    }
    if (cleanMetrics.length === 0) {
      setFormError("Add at least one result metric.");
      return;
    }

    const duplicate = studies.find((study) =>
      study.id !== editingId && (
        study.slug === normalizedSlug || study.legacySlugs?.includes(normalizedSlug)
      ),
    );
    if (duplicate) {
      setFormError(`This URL slug is already used by “${duplicate.client}”. Choose a unique slug.`);
      return;
    }

    const previousStudy = studies.find((study) => study.id === editingId);
    const previousSlugs = previousStudy && previousStudy.slug !== normalizedSlug
      ? Array.from(new Set([...(previousStudy.legacySlugs ?? []), previousStudy.slug]))
      : previousStudy?.legacySlugs;

    const studyToSave: CaseStudyRecord = {
      ...(previousStudy ?? {}),
      id: previousStudy?.id ?? `case-study-draft-${Date.now()}`,
      slug: normalizedSlug,
      client: client.trim(),
      industry: industry.trim(),
      overview: overview.trim(),
      challenge: challenge.trim(),
      solution: solution.trim(),
      approach: cleanApproach,
      metrics: cleanMetrics,
      testimonial: { quote: quote.trim(), author: author.trim() },
      legacySlugs: previousSlugs,
    };

    const updated = editingId
      ? studies.map((study) => (study.id === editingId ? studyToSave : study))
      : [...studies, studyToSave];

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      if (isCaseStudyApiConfigured()) {
        if (previousStudy) {
          if (!previousStudy.id) {
            throw new CaseStudyApiError(400, "MISSING_CASE_STUDY_ID", "This Case Study has no API ID. Reload the list before editing it.");
          }
          const updatedStudy = await updateCaseStudyViaApi(previousStudy.id, studyToSave, previousStudy.displayOrder);
          setStudies((current) => current.map((study) => study.id === previousStudy.id ? updatedStudy : study));
          setSuccessMessage("Case Study updated in the PHP API and MySQL.");
        } else {
          const createdStudy = await createCaseStudyViaApi(studyToSave, studies.length);
          setStudies((current) => [...current, createdStudy]);
          setSuccessMessage("Case Study created in the PHP API and MySQL.");
        }
      } else {
        setStudies(saveCaseStudies(updated));
        setSuccessMessage("Case Study saved to the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }
      clearForm();
    } catch (error) {
      setApiError(caseStudyApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (study: CaseStudyRecord) => {
    if (!confirm(`Delete “${study.client}”?\n\nThis action cannot be undone.`)) return;

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);
    try {
      if (isCaseStudyApiConfigured()) {
        if (!study.id) {
          throw new CaseStudyApiError(400, "MISSING_CASE_STUDY_ID", "This Case Study has no API ID. Reload the list before deleting it.");
        }
        await deleteCaseStudyViaApi(study.id);
        setStudies((current) => current.filter((item) => item.id !== study.id));
        setSuccessMessage("Case Study deleted from the PHP API and MySQL.");
      } else {
        setStudies(saveCaseStudies(studies.filter((item) => item.id !== study.id)));
        setSuccessMessage("Case Study deleted from the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }

      if (editingId === study.id) clearForm();
    } catch (error) {
      setApiError(caseStudyApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-white/15 bg-[#0B241F] p-5 text-white shadow-xl md:p-7"
      >
        <div className="flex flex-col gap-3 border-b border-white/15 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {editingId ? "Edit Case Study" : "Add New Case Study"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-300">
              Create a project record that uses the existing public Case Study cards and detail-page layout.
            </p>
            <p className="mt-2 text-xs text-gray-300">
              Fields marked <span className="font-bold text-[#7FF5DE]">*</span> are required.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#2DD4BF]/30 bg-[#123832] px-3 py-1 text-xs font-semibold text-[#7FF5DE]">
            {editingId ? "Editing existing study" : "New case study"}
          </span>
        </div>

        {apiError && (
          <p role="alert" className="rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
            {apiError}
          </p>
        )}
        {successMessage && (
          <p role="status" className="rounded-xl border border-emerald-300/30 bg-emerald-950/30 px-4 py-3 text-sm font-medium text-emerald-200">
            {successMessage}
          </p>
        )}

        {formError && (
          <p role="alert" className="rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
            {formError}
          </p>
        )}

        <FormSection
          title="Case Study Basic Information"
          description="These fields identify the project and control its public URL and industry badge."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="case-client" className={labelClassName}>Project / Client Name <span className="text-[#7FF5DE]" aria-hidden="true">*</span></label>
              <p className={helpTextClassName}>Displayed as the main title on the public Case Study card and detail page.</p>
              <input
                id="case-client"
                type="text"
                required
                placeholder="e.g. E-Commerce Brand"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  if (!editingId && !slugManuallyEdited) setSlug(normalizeCaseStudySlug(e.target.value));
                  setFormError("");
                }}
                className={`${fieldClassName} mt-2`}
              />
            </div>

            <div>
              <label htmlFor="case-industry" className={labelClassName}>Industry <span className="text-[#7FF5DE]" aria-hidden="true">*</span></label>
              <p className={helpTextClassName}>Displayed in the industry badge on the public detail page.</p>
              <input
                id="case-industry"
                type="text"
                required
                placeholder="e.g. E-Commerce"
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setFormError(""); }}
                className={`${fieldClassName} mt-2`}
              />
            </div>

            <div>
              <label htmlFor="case-slug" className={labelClassName}>URL Slug <span className="text-[#7FF5DE]" aria-hidden="true">*</span></label>
              <p className={helpTextClassName}>Becomes the public route: <code className="rounded bg-black/30 px-1.5 py-0.5 text-[#A7F3D0]">/case-studies/your-slug</code>.</p>
              <input
                id="case-slug"
                type="text"
                required
                placeholder="ecommerce-brand"
                value={slug}
                onChange={(e) => { setSlugManuallyEdited(true); setSlug(e.target.value); setFormError(""); }}
                className={`${fieldClassName} mt-2 bg-[#071B17]`}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Project Overview"
          description="This summary appears below the Case Study title on the public detail page."
        >
          <div>
            <label htmlFor="case-overview" className={labelClassName}>Project Summary <span className="text-[#7FF5DE]" aria-hidden="true">*</span></label>
            <p className={helpTextClassName}>Explain the project context, the starting situation, and the overall work in a concise overview.</p>
            <textarea
              id="case-overview"
              required
              rows={5}
              placeholder="This brand was facing a growth challenge..."
              value={overview}
              onChange={(e) => { setOverview(e.target.value); setFormError(""); }}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="The Challenge"
          description="This content appears in the Challenge column on the public detail page and in the public Case Study card."
        >
          <div>
            <label htmlFor="case-challenge" className={labelClassName}>Challenge Description <span className="text-[#7FF5DE]" aria-hidden="true">*</span></label>
            <p className={helpTextClassName}>Describe the client's main problem before working with RaahX.</p>
            <textarea
              id="case-challenge"
              required
              rows={4}
              placeholder="Struggling with high customer acquisition costs..."
              value={challenge}
              onChange={(e) => { setChallenge(e.target.value); setFormError(""); }}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="The Solution"
          description="This content appears in the Solution column on the public detail page and in the public Case Study card."
        >
          <div>
            <label htmlFor="case-solution" className={labelClassName}>Solution Description <span className="text-[#7FF5DE]" aria-hidden="true">*</span></label>
            <p className={helpTextClassName}>Explain the strategy and implementation RaahX delivered for the client.</p>
            <textarea
              id="case-solution"
              required
              rows={4}
              placeholder="Implemented a targeted growth strategy..."
              value={solution}
              onChange={(e) => { setSolution(e.target.value); setFormError(""); }}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="Strategy / Approach"
          description="Each step appears in the numbered Our Approach section on the public detail page."
        >
          <div className="space-y-4">
            {approach.map((step, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#A7F3D0]">Approach Step {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => setApproach((current) => current.filter((_, stepIndex) => stepIndex !== index))}
                    aria-label={`Remove approach step ${index + 1}`}
                    className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={`approach-title-${index}`} className={labelClassName}>Step Title</label>
                    <input
                      id={`approach-title-${index}`}
                      type="text"
                      placeholder="e.g. Audit & Diagnosis"
                      value={step.title}
                      onChange={(e) => updateApproach(index, { title: e.target.value })}
                      className={`${fieldClassName} mt-2`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`approach-description-${index}`} className={labelClassName}>Step Description</label>
                    <textarea
                      id={`approach-description-${index}`}
                      rows={3}
                      placeholder="Explain what happened in this step..."
                      value={step.description}
                      onChange={(e) => updateApproach(index, { description: e.target.value })}
                      className={`${fieldClassName} mt-2 resize-y`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setApproach((current) => [...current, emptyApproachStep()])}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2DD4BF]/40 px-3 py-2 text-xs font-semibold text-[#7FF5DE] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
          >
            <Plus size={15} /> Add Approach Step
          </button>
        </FormSection>

        <FormSection
          title="Results / Outcomes"
          description="These value-and-label pairs appear as the three-column metrics section on the public Case Study card and detail page."
        >
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#A7F3D0]">Result {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => setMetrics((current) => current.filter((_, metricIndex) => metricIndex !== index))}
                    aria-label={`Remove result ${index + 1}`}
                    className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={`metric-value-${index}`} className={labelClassName}>Result Value</label>
                    <p className={helpTextClassName}>The large number or outcome shown first.</p>
                    <input
                      id={`metric-value-${index}`}
                      type="text"
                      placeholder="e.g. 346%"
                      value={metric.value}
                      onChange={(e) => updateMetric(index, { value: e.target.value })}
                      className={`${fieldClassName} mt-2`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`metric-label-${index}`} className={labelClassName}>Result Label</label>
                    <p className={helpTextClassName}>The label displayed below the result value.</p>
                    <input
                      id={`metric-label-${index}`}
                      type="text"
                      placeholder="e.g. ROAS"
                      value={metric.label}
                      onChange={(e) => updateMetric(index, { label: e.target.value })}
                      className={`${fieldClassName} mt-2`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMetrics((current) => [...current, emptyMetric()])}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2DD4BF]/40 px-3 py-2 text-xs font-semibold text-[#7FF5DE] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
          >
            <Plus size={15} /> Add Result Metric
          </button>
        </FormSection>

        <FormSection
          title="Testimonial"
          description="These optional fields appear in the testimonial section near the bottom of the public detail page."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="case-testimonial-quote" className={labelClassName}>Testimonial Quote</label>
              <p className={helpTextClassName}>Enter the client's quote as it should appear in quotation marks.</p>
              <textarea
                id="case-testimonial-quote"
                rows={4}
                placeholder="RaahX helped us achieve results we did not think were possible..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className={`${fieldClassName} mt-2 resize-y`}
              />
            </div>
            <div>
              <label htmlFor="case-testimonial-author" className={labelClassName}>Testimonial Author</label>
              <p className={helpTextClassName}>Shown below the quote as the client or company attribution.</p>
              <input
                id="case-testimonial-author"
                type="text"
                placeholder="e.g. E-Commerce Client"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={`${fieldClassName} mt-2`}
              />
            </div>
          </div>
        </FormSection>

        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-relaxed text-gray-300">
          <span className="font-semibold text-gray-100">Current public model:</span> there is no stored featured-image, featured-status, technologies, or separate CTA field. All saved studies automatically use the existing public Case Study card, detail layout, and CTA.
        </div>

        <div className="flex flex-wrap gap-3 border-t border-white/15 pt-5">
          <button
            type="button"
            onClick={clearForm}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-gray-100 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
          >
            <X size={16} /> {editingId ? "Cancel" : "Clear Form"}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#14B8A6]/10 transition hover:bg-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#7FF5DE] focus:ring-offset-2 focus:ring-offset-[#0B241F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingId ? <Check size={16} /> : <Plus size={16} />}
            {isSaving ? "Saving..." : editingId ? "Update Case Study" : "Add Case Study"}
          </button>
        </div>
      </form>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-secondary">Current Case Studies</h3>
          <p className="mt-1 text-sm text-gray-600">The list order is the public Case Study display order. New studies are appended after the existing studies.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <div key={study.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#102C25] p-4">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-white">{study.client}</h4>
                <p className="truncate text-xs text-[#7FF5DE]">/case-studies/{study.slug}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(study)}
                  aria-label={`Edit ${study.client}`}
                  className="rounded-lg p-2 text-gray-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(study)}
                  aria-label={`Delete ${study.client}`}
                  className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
