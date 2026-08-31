import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Edit2, Plus, Trash2, X } from "lucide-react";
import {
  createServiceViaApi,
  deleteServiceViaApi,
  fetchServicesFromApi,
  getStoredServices,
  isServiceApiConfigured,
  saveStoredServices,
  ServiceApiError,
  type ServiceRecord,
  updateServiceViaApi,
} from "../../services/serviceStore";
import {
  DEFAULT_SERVICE_ICON,
  getServiceIcon,
  getServiceIconName,
  SERVICE_ICON_OPTIONS,
  type ServiceIconName,
} from "../../utils/getServiceIcon";

const fieldClassName =
  "w-full rounded-xl border border-white/20 bg-[#071B17] px-4 py-3 text-sm text-white placeholder:text-gray-400 shadow-inner outline-none transition focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/30 disabled:cursor-not-allowed disabled:opacity-60";
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
        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-[#7FF5DE]">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">{description}</p>
      </div>
      {children}
    </section>
  );
}

function getServiceApiErrorMessage(error: unknown): string {
  if (error instanceof ServiceApiError) {
    if (error.status === 401 || error.status === 403) return "The PHP API session is not authenticated. Sign out and sign in again.";
    if (error.status === 409) return error.message;
    return error.message;
  }
  return "The Services API is unavailable. Your local fallback data is still available.";
}

type ServiceStat = ServiceRecord["stats"][number];
type ServiceStep = ServiceRecord["process"][number];
type ContentSection = NonNullable<ServiceRecord["contentSections"]>[number];
type ContentItem = ContentSection["items"][number];

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function RowActions({ index, count, label, move, remove }: { index: number; count: number; label: string; move: (direction: -1 | 1) => void; remove: () => void }) {
  return <div className="flex shrink-0 gap-1"><button type="button" disabled={index === 0} onClick={() => move(-1)} aria-label={`Move ${label} up`} className="rounded-lg border border-white/15 p-2 text-gray-200 disabled:opacity-30"><ChevronUp size={15} /></button><button type="button" disabled={index === count - 1} onClick={() => move(1)} aria-label={`Move ${label} down`} className="rounded-lg border border-white/15 p-2 text-gray-200 disabled:opacity-30"><ChevronDown size={15} /></button><button type="button" onClick={remove} aria-label={`Remove ${label}`} className="rounded-lg border border-red-300/20 p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={15} /></button></div>;
}

function StatsEditor({ rows, onChange }: { rows: ServiceStat[]; onChange: (rows: ServiceStat[]) => void }) {
  const update = (index: number, patch: Partial<ServiceStat>) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  return <div className="space-y-3">{rows.map((row, index) => <div key={index} className="grid gap-3 rounded-xl border border-white/10 bg-black/15 p-4 md:grid-cols-[1fr_1fr_auto]"><label className={labelClassName}>Label<input value={row.label} onChange={(event) => update(index, { label: event.target.value })} className={`${fieldClassName} mt-2`} /></label><label className={labelClassName}>Value<input value={row.value} onChange={(event) => update(index, { value: event.target.value })} className={`${fieldClassName} mt-2`} /></label><RowActions index={index} count={rows.length} label={`stat ${index + 1}`} move={(direction) => onChange(moveItem(rows, index, direction))} remove={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} /></div>)}<button type="button" onClick={() => onChange([...rows, { label: "", value: "" }])} className="inline-flex items-center gap-2 rounded-xl border border-[#2DD4BF]/40 px-4 py-2 text-sm font-semibold text-[#7FF5DE]"><Plus size={15} /> Add Stat</button></div>;
}

function StepsEditor({ rows, onChange, singular, addLabel }: { rows: ServiceStep[]; onChange: (rows: ServiceStep[]) => void; singular: string; addLabel: string }) {
  const update = (index: number, patch: Partial<ServiceStep>) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  return <div className="space-y-3">{rows.map((row, index) => <div key={index} className="rounded-xl border border-white/10 bg-black/15 p-4"><div className="mb-3 flex items-center justify-between"><strong className="text-sm text-white">{singular} {index + 1}</strong><RowActions index={index} count={rows.length} label={`${singular.toLowerCase()} ${index + 1}`} move={(direction) => onChange(moveItem(rows, index, direction))} remove={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} /></div><div className="grid gap-3 md:grid-cols-2"><label className={labelClassName}>Title<input value={row.title} onChange={(event) => update(index, { title: event.target.value })} className={`${fieldClassName} mt-2`} /></label><label className={labelClassName}>Description<textarea value={row.description} onChange={(event) => update(index, { description: event.target.value })} rows={3} className={`${fieldClassName} mt-2 resize-y`} /></label></div></div>)}<button type="button" onClick={() => onChange([...rows, { title: "", description: "" }])} className="inline-flex items-center gap-2 rounded-xl border border-[#2DD4BF]/40 px-4 py-2 text-sm font-semibold text-[#7FF5DE]"><Plus size={15} /> {addLabel}</button></div>;
}

function ContentSectionsEditor({ sections, onChange }: { sections: ContentSection[]; onChange: (sections: ContentSection[]) => void }) {
  const nextSectionKey = () => { let number = sections.length + 1; while (sections.some((section) => section.key === `section-${number}`)) number++; return `section-${number}`; };
  const updateSection = (index: number, patch: Partial<ContentSection>) => onChange(sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
  const updateItem = (sectionIndex: number, itemIndex: number, patch: Partial<ContentItem>) => updateSection(sectionIndex, { items: sections[sectionIndex].items.map((item, index) => index === itemIndex ? { ...item, ...patch } : item) });
  return <div className="space-y-5">{sections.map((section, sectionIndex) => <article key={sectionIndex} className="rounded-2xl border border-white/15 bg-black/15 p-4 md:p-5"><div className="mb-4 flex items-center justify-between gap-3"><strong className="text-sm text-white">Additional Section {sectionIndex + 1}</strong><RowActions index={sectionIndex} count={sections.length} label={`section ${sectionIndex + 1}`} move={(direction) => onChange(moveItem(sections, sectionIndex, direction))} remove={() => onChange(sections.filter((_, index) => index !== sectionIndex))} /></div><div className="grid gap-4 md:grid-cols-2"><label className={labelClassName}>Section Key<input value={section.key} onChange={(event) => updateSection(sectionIndex, { key: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} placeholder="e.g. faqs" className={`${fieldClassName} mt-2`} /></label><label className={labelClassName}>Eyebrow<input value={section.eyebrow || ""} onChange={(event) => updateSection(sectionIndex, { eyebrow: event.target.value })} className={`${fieldClassName} mt-2`} /></label><label className={labelClassName}>Heading<input value={section.heading} onChange={(event) => updateSection(sectionIndex, { heading: event.target.value })} className={`${fieldClassName} mt-2`} /></label><label className={labelClassName}>Section Introduction<textarea value={section.body || ""} onChange={(event) => updateSection(sectionIndex, { body: event.target.value })} rows={3} className={`${fieldClassName} mt-2 resize-y`} /></label></div><div className="mt-5 space-y-3"><h5 className="text-xs font-bold uppercase tracking-wider text-[#7FF5DE]">Section Items</h5>{section.items.map((item, itemIndex) => <div key={itemIndex} className="rounded-xl border border-white/10 p-4"><div className="mb-3 flex justify-end"><RowActions index={itemIndex} count={section.items.length} label={`item ${itemIndex + 1}`} move={(direction) => updateSection(sectionIndex, { items: moveItem(section.items, itemIndex, direction) })} remove={() => updateSection(sectionIndex, { items: section.items.filter((_, index) => index !== itemIndex) })} /></div><div className="grid gap-3 md:grid-cols-2"><label className={labelClassName}>{section.key === "faqs" ? "Question" : "Item Title"}<input value={item.title} onChange={(event) => updateItem(sectionIndex, itemIndex, { title: event.target.value })} className={`${fieldClassName} mt-2`} /></label><label className={labelClassName}>{section.key === "faqs" ? "Answer" : "Item Description"}<textarea value={item.description} onChange={(event) => updateItem(sectionIndex, itemIndex, { description: event.target.value })} rows={3} className={`${fieldClassName} mt-2 resize-y`} /></label><label className={`${labelClassName} md:col-span-2`}>Optional Details<textarea value={item.details || ""} onChange={(event) => updateItem(sectionIndex, itemIndex, { details: event.target.value })} rows={3} className={`${fieldClassName} mt-2 resize-y`} /></label></div></div>)}<button type="button" onClick={() => updateSection(sectionIndex, { items: [...section.items, { title: "", description: "", details: "" }] })} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"><Plus size={15} /> {section.key === "faqs" ? "Add FAQ" : "Add Section Item"}</button></div></article>)}<button type="button" onClick={() => onChange([...sections, { key: nextSectionKey(), eyebrow: "", heading: "", body: "", items: [] }])} className="inline-flex items-center gap-2 rounded-xl bg-[#14B8A6] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={15} /> Add Content Section</button></div>;
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Core Service Fields
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState<ServiceIconName>(DEFAULT_SERVICE_ICON);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardCtaLabel, setCardCtaLabel] = useState("");
  const [heroCtaLabel, setHeroCtaLabel] = useState("");
  const [overviewTitle, setOverviewTitle] = useState("");
  const [processTitle, setProcessTitle] = useState("");
  const [benefitsTitle, setBenefitsTitle] = useState("");
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaSupportingText, setCtaSupportingText] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");

  const [stats, setStats] = useState<ServiceStat[]>([]);

  // Content Sections
  const [overview, setOverview] = useState("");
  const [whyChooseTitle, setWhyChooseTitle] = useState("");
  const [whyChooseText, setWhyChooseText] = useState("");

  const [process, setProcess] = useState<ServiceStep[]>([]);
  const [benefits, setBenefits] = useState<ServiceStep[]>([]);

  // Testimonial
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fallbackServices = getStoredServices();
    setServices(fallbackServices);
    setDisplayOrder(fallbackServices.length);

    if (!isServiceApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchServicesFromApi()
      .then((remoteServices) => {
        if (!isMounted) return;
        if (remoteServices.length > 0 || fallbackServices.length === 0) {
          setServices(remoteServices);
          setDisplayOrder(remoteServices.length);
        } else {
          setApiError("The Services API returned no records. Run the additive CMS migration before editing production data.");
        }
      })
      .catch((error) => {
        if (isMounted) setApiError(getServiceApiErrorMessage(error));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const hasIncompleteStats = stats.some((stat) => !stat.label.trim() || !stat.value.trim());
    const hasIncompleteSteps = [...process, ...benefits].some((row) => !row.title.trim() || !row.description.trim());
    const sectionKeys = contentSections.map((section) => section.key.trim()).filter(Boolean);
    const hasIncompleteSections = contentSections.some((section) => !section.key.trim() || !section.heading.trim() || section.items.some((item) => !item.title.trim()));
    const hasDuplicateSectionKeys = new Set(sectionKeys).size !== sectionKeys.length;
    if (hasIncompleteStats || hasIncompleteSteps || hasIncompleteSections || hasDuplicateSectionKeys) {
      setApiError("Complete every added row and use a unique key and heading for each additional section before saving.");
      return;
    }

    const serviceObj: ServiceRecord = {
      slug: slug.trim(),
      name: name.trim(),
      icon: iconName,
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      cardDescription: cardDescription.trim(),
      cardCtaLabel: cardCtaLabel.trim(),
      heroCtaLabel: heroCtaLabel.trim(),
      overviewTitle: overviewTitle.trim(),
      overview: overview.trim(),
      whyChooseTitle: whyChooseTitle.trim(),
      whyChooseText: whyChooseText.trim(),
      processTitle: processTitle.trim(),
      stats: stats.map((stat) => ({ label: stat.label.trim(), value: stat.value.trim() })),
      process: process.map((step) => ({ title: step.title.trim(), description: step.description.trim() })),
      benefitsTitle: benefitsTitle.trim(),
      benefits: benefits.map((benefit) => ({ title: benefit.title.trim(), description: benefit.description.trim() })),
      contentSections: contentSections.map((section) => ({ ...section, key: section.key.trim(), eyebrow: section.eyebrow?.trim(), heading: section.heading.trim(), body: section.body?.trim(), items: section.items.map((item) => ({ title: item.title.trim(), description: item.description.trim(), details: item.details?.trim() })) })),
      testimonial: { quote: quote.trim(), author: author.trim() },
      displayOrder,
      ctaTitle: ctaTitle.trim(),
      ctaText: ctaText.trim(),
      ctaSupportingText: ctaSupportingText.trim(),
      ctaLabel: ctaLabel.trim(),
    };
    const existing = isEditing
      ? services.find((service) => service.id === isEditing || service.slug === isEditing)
      : undefined;

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      if (isServiceApiConfigured()) {
        if (existing) {
          if (!existing.id) {
            throw new ServiceApiError(400, "MISSING_SERVICE_ID", "This service has no API ID. Reload the Services list before editing it.");
          }
          const updatedService = await updateServiceViaApi(existing.id, serviceObj, displayOrder);
          setServices((current) => current.map((service) => service.id === existing.id ? updatedService : service));
          setSuccessMessage("Service updated in the PHP API and MySQL.");
        } else {
          const createdService = await createServiceViaApi(serviceObj, displayOrder);
          setServices((current) => [...current, createdService]);
          setSuccessMessage("Service created in the PHP API and MySQL.");
        }
      } else {
        // Keep the existing browser-only behavior available until a PHP API URL
        // is configured for this environment.
        const localRecord: ServiceRecord = { ...serviceObj, id: existing?.id, displayOrder };
        const updated = existing
          ? services.map((service) => service.id === existing.id || service.slug === existing.slug ? localRecord : service)
          : [...services, localRecord];
        setServices(saveStoredServices(updated));
        setSuccessMessage("Service saved to the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }
      resetForm();
      setDisplayOrder(existing ? services.length : services.length + 1);
    } catch (error) {
      setApiError(getServiceApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service: ServiceRecord) => {
    setIsEditing(service.id ?? service.slug);
    setSlug(service.slug);
    setName(service.name);
    setIconName(getServiceIconName(service.icon));
    setHeroTitle(service.heroTitle || "");
    setHeroSubtitle(service.heroSubtitle || "");
    setCardDescription(service.cardDescription || "");
    setCardCtaLabel(service.cardCtaLabel || "");
    setHeroCtaLabel(service.heroCtaLabel || "");
    setOverviewTitle(service.overviewTitle || "");
    setOverview(service.overview || "");
    setWhyChooseTitle(service.whyChooseTitle || "");
    setWhyChooseText(service.whyChooseText || "");
    setProcessTitle(service.processTitle || "");
    setBenefitsTitle(service.benefitsTitle || "");
    setContentSections((service.contentSections || []).map((section) => ({ ...section, items: section.items.map((item) => ({ ...item })) })));
    setDisplayOrder(service.displayOrder ?? 0);
    setCtaTitle(service.ctaTitle || "");
    setCtaText(service.ctaText || "");
    setCtaSupportingText(service.ctaSupportingText || "");
    setCtaLabel(service.ctaLabel || "");

    setStats((service.stats || []).map((stat) => ({ ...stat })));
    setProcess((service.process || []).map((step) => ({ ...step })));
    setBenefits((service.benefits || []).map((benefit) => ({ ...benefit })));

    setQuote(service.testimonial?.quote || "");
    setAuthor(service.testimonial?.author || "");
  };

  const handleDelete = async (service: ServiceRecord) => {
    if (!confirm(`Delete "${service.name}"?\n\nThis removes the service from the public website.`)) return;

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);
    try {
      if (isServiceApiConfigured()) {
        if (!service.id) {
          throw new ServiceApiError(400, "MISSING_SERVICE_ID", "This service has no API ID. Reload the Services list before deleting it.");
        }
        await deleteServiceViaApi(service.id);
        setServices((current) => current.filter((item) => item.id !== service.id));
        setSuccessMessage("Service deleted from the PHP API and MySQL.");
      } else {
        setServices(saveStoredServices(services.filter((item) => item.id !== service.id && item.slug !== service.slug)));
        setSuccessMessage("Service deleted from the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }
    } catch (error) {
      setApiError(getServiceApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setApiError("");
    setIsEditing(null);
    setSlug("");
    setName("");
    setIconName(DEFAULT_SERVICE_ICON);
    setHeroTitle("");
    setHeroSubtitle("");
    setCardDescription("");
    setCardCtaLabel("");
    setHeroCtaLabel("");
    setOverviewTitle("");
    setOverview("");
    setWhyChooseTitle("");
    setWhyChooseText("");
    setProcessTitle("");
    setBenefitsTitle("");
    setContentSections([]);
    setDisplayOrder(services.length);
    setCtaTitle("");
    setCtaText("");
    setCtaSupportingText("");
    setCtaLabel("");
    setStats([]);
    setProcess([]);
    setBenefits([]);
    setQuote("");
    setAuthor("");
  };

  const SelectedIcon = getServiceIcon(iconName);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleAddOrUpdate}
        className="space-y-6 rounded-2xl border border-white/15 bg-[#0B241F] p-5 text-white shadow-xl md:p-7"
      >
        <div className="flex flex-col gap-3 border-b border-white/15 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white md:text-2xl">
              {isEditing ? "Edit Service Detail Page" : "Add New Service Detail Page"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-300">
              Complete the same structured data used by the public Service cards and detail pages.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#2DD4BF]/30 bg-[#123832] px-3 py-1 text-xs font-semibold text-[#7FF5DE]">
            {isEditing ? "Editing existing service" : "New service"}
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

        <FormSection
          title="Service Basic Information"
          description="Identify the service and choose the icon used across the public website."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="service-name" className={labelClassName}>Service Name</label>
              <p className={helpTextClassName}>The name visitors will see on service cards and pages.</p>
              <input
                id="service-name"
                type="text"
                placeholder="e.g. Branding Services"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                className={`${fieldClassName} mt-2`}
                required
              />
            </div>

            <div>
              <label htmlFor="service-slug" className={labelClassName}>URL Slug</label>
              <p className={helpTextClassName}>Used in the page URL: /services/your-slug</p>
              <input
                id="service-slug"
                type="text"
                placeholder="e.g. branding-services"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={`${fieldClassName} mt-2`}
                required
              />
            </div>

            <div>
              <label htmlFor="service-icon" className={labelClassName}>Lucide Icon</label>
              <p className={helpTextClassName}>Choose a visual icon. It is stored as a safe icon name.</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#2DD4BF]/40 bg-[#123832] text-[#7FF5DE]">
                  <SelectedIcon size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <select
                  id="service-icon"
                  value={iconName}
                  onChange={(e) => setIconName(getServiceIconName(e.target.value))}
                  className={`${fieldClassName} cursor-pointer`}
                >
                  {SERVICE_ICON_OPTIONS.map((option) => (
                    <option key={option.name} value={option.name} className="bg-[#071B17] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div><label htmlFor="card-description" className={labelClassName}>Service Card Description</label><textarea id="card-description" value={cardDescription} onChange={(e) => setCardDescription(e.target.value)} rows={3} className={`${fieldClassName} mt-2 resize-y`} /></div>
            <div><label htmlFor="card-cta" className={labelClassName}>Service Card CTA</label><input id="card-cta" value={cardCtaLabel} onChange={(e) => setCardCtaLabel(e.target.value)} className={`${fieldClassName} mt-2`} /></div>
            <div><label htmlFor="display-order" className={labelClassName}>Display Order</label><p className={helpTextClassName}>Lower numbers appear first.</p><input id="display-order" type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(Math.max(0, Number(e.target.value) || 0))} className={`${fieldClassName} mt-2`} /></div>
          </div>
        </FormSection>

        <FormSection
          title="Hero Section"
          description="Write the headline and supporting message shown at the top of the service detail page."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="hero-title" className={labelClassName}>Hero Title Tagline</label>
              <p className={helpTextClassName}>A short, compelling statement about the service.</p>
              <input
                id="hero-title"
                type="text"
                placeholder="e.g. Create a Brand That Customers Trust and Remember"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className={`${fieldClassName} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="hero-subtitle" className={labelClassName}>Hero Subtitle</label>
              <p className={helpTextClassName}>Add supporting context beneath the hero title.</p>
              <textarea
                id="hero-subtitle"
                placeholder="e.g. Forge a powerful market identity..."
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={4}
                className={`${fieldClassName} mt-2 resize-y`}
              />
            </div>
          </div>

          <div><label htmlFor="hero-cta" className={labelClassName}>Hero CTA Label</label><input id="hero-cta" value={heroCtaLabel} onChange={(e) => setHeroCtaLabel(e.target.value)} className={`${fieldClassName} mt-2`} /></div>

          <div><h5 className={labelClassName}>Stats Banner</h5><p className={helpTextClassName}>Add, edit, remove, or reorder each label and value.</p><div className="mt-3"><StatsEditor rows={stats} onChange={setStats} /></div></div>
        </FormSection>

        <FormSection
          title="Main Service Content"
          description="Explain the service clearly in the main overview section."
        >
          <div><label htmlFor="overview-title" className={labelClassName}>Overview Section Title</label><input id="overview-title" value={overviewTitle} onChange={(e) => setOverviewTitle(e.target.value)} className={`${fieldClassName} mt-2`} /></div>
          <div>
            <label htmlFor="service-overview" className={labelClassName}>Main Service Overview Paragraph</label>
            <p className={helpTextClassName}>Describe the service, its value, and the results it is designed to achieve.</p>
            <textarea
              id="service-overview"
              placeholder="Strong brands create lasting impressions..."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={5}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="Why Choose Us"
          description="Show visitors why RaahX is the right partner for this service."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="why-choose-title" className={labelClassName}>Why Choose Section Title</label>
              <p className={helpTextClassName}>The heading for this section.</p>
              <input
                id="why-choose-title"
                type="text"
                placeholder="e.g. Why Choose Our Branding Services"
                value={whyChooseTitle}
                onChange={(e) => setWhyChooseTitle(e.target.value)}
                className={`${fieldClassName} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="why-choose-text" className={labelClassName}>Why Choose Section Text</label>
              <p className={helpTextClassName}>Explain the differentiators and benefits of working with RaahX.</p>
              <textarea
                id="why-choose-text"
                placeholder="A memorable brand creates trust..."
                value={whyChooseText}
                onChange={(e) => setWhyChooseText(e.target.value)}
                rows={4}
                className={`${fieldClassName} mt-2 resize-y`}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Process"
          description="Define the steps visitors will see in the service process section."
        >
          <div><label htmlFor="process-title" className={labelClassName}>Process Section Title</label><input id="process-title" value={processTitle} onChange={(e) => setProcessTitle(e.target.value)} className={`${fieldClassName} mt-2`} /></div>
          <div><h5 className={labelClassName}>Process Steps</h5><p className={helpTextClassName}>Add, edit, remove, or reorder the steps shown publicly.</p><div className="mt-3"><StepsEditor rows={process} onChange={setProcess} singular="Step" addLabel="Add Step" /></div></div>
        </FormSection>

        <FormSection
          title="Unfair Advantage"
          description="List the practical advantages and outcomes this service provides."
        >
          <div><label htmlFor="benefits-title" className={labelClassName}>Benefits Section Title</label><input id="benefits-title" value={benefitsTitle} onChange={(e) => setBenefitsTitle(e.target.value)} className={`${fieldClassName} mt-2`} /></div>
          <div><h5 className={labelClassName}>Benefits</h5><p className={helpTextClassName}>Add, edit, remove, or reorder the outcomes shown publicly.</p><div className="mt-3"><StepsEditor rows={benefits} onChange={setBenefits} singular="Benefit" addLabel="Add Benefit" /></div></div>
        </FormSection>

        <FormSection
          title="Additional Service Sections"
          description="Manage FAQs, service lists, audience sections, deliverables, and other document-defined repeatable content."
        >
          <ContentSectionsEditor sections={contentSections} onChange={setContentSections} />
        </FormSection>

        <FormSection
          title="Final Call to Action"
          description="Control the service-specific proposal message at the bottom of the page."
        >
          <div className="grid gap-5 md:grid-cols-2"><div><label htmlFor="cta-title" className={labelClassName}>CTA Title</label><input id="cta-title" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} className={`${fieldClassName} mt-2`} /></div><div><label htmlFor="cta-label" className={labelClassName}>CTA Button Label</label><input id="cta-label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={`${fieldClassName} mt-2`} /></div></div>
          <div><label htmlFor="cta-text" className={labelClassName}>CTA Description</label><textarea id="cta-text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} rows={3} className={`${fieldClassName} mt-2 resize-y`} /></div>
          <div><label htmlFor="cta-support" className={labelClassName}>CTA Supporting Text</label><input id="cta-support" value={ctaSupportingText} onChange={(e) => setCtaSupportingText(e.target.value)} className={`${fieldClassName} mt-2`} /></div>
        </FormSection>

        <FormSection
          title="Testimonial"
          description="Optionally add a client quote and attribution for this service page."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="testimonial-quote" className={labelClassName}>Testimonial Quote</label>
              <p className={helpTextClassName}>Use a concise quote that supports the service outcome.</p>
              <textarea
                id="testimonial-quote"
                placeholder='e.g. "RaahX gave our business a completely new identity..."'
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                className={`${fieldClassName} mt-2 resize-y`}
              />
            </div>
            <div>
              <label htmlFor="testimonial-author" className={labelClassName}>Testimonial Author</label>
              <p className={helpTextClassName}>Name or role shown below the quote.</p>
              <input
                id="testimonial-author"
                type="text"
                placeholder="e.g. Usman Tariq"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={`${fieldClassName} mt-2`}
              />
            </div>
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-3 border-t border-white/15 pt-5">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#14B8A6]/10 transition-all hover:bg-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#7FF5DE] focus:ring-offset-2 focus:ring-offset-[#0B241F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditing ? <Check size={16} /> : <Plus size={16} />}
            {isSaving ? "Saving..." : isEditing ? "Update Service Detail Page" : "Add Service Detail Page"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-gray-100 transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = getServiceIcon(service.icon);
          return (
            <div key={service.slug} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#123832] text-[#7FF5DE]">
                  <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-white">{service.name}</h4>
                  <p className="truncate text-xs text-[#7FF5DE]">/services/{service.slug}</p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(service)}
                  aria-label={`Edit ${service.name}`}
                  className="rounded-lg p-2 text-gray-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(service)}
                  aria-label={`Delete ${service.name}`}
                  className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
