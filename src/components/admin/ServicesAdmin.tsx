import React, { useEffect, useState } from "react";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { type ServiceData } from "../../data/servicesData";
import { getStoredServices, saveStoredServices } from "../../services/serviceStore";
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

export default function ServicesAdmin() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Core Service Fields
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState<ServiceIconName>(DEFAULT_SERVICE_ICON);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  // Stats (Format: Label | Value)
  const [statsRaw, setStatsRaw] = useState("");

  // Content Sections
  const [overview, setOverview] = useState("");
  const [whyChooseTitle, setWhyChooseTitle] = useState("");
  const [whyChooseText, setWhyChooseText] = useState("");

  // How We Make It Happen (Format: Title | Description)
  const [processRaw, setProcessRaw] = useState("");

  // Your Unfair Advantage (Format: Title | Description)
  const [benefitsRaw, setBenefitsRaw] = useState("");

  // Testimonial
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    setServices(getStoredServices());
  }, []);

  const saveToStorage = (updated: ServiceData[]) => {
    setServices(saveStoredServices(updated));
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const parsedStats = statsRaw
      .split("\n")
      .map((line) => {
        const [label, value] = line.split("|");
        return { label: label?.trim() || "", value: value?.trim() || "" };
      })
      .filter((stat) => stat.label && stat.value);

    const parsedProcess = processRaw
      .split("\n")
      .map((line) => {
        const [title, description] = line.split("|");
        return { title: title?.trim() || "", description: description?.trim() || "" };
      })
      .filter((step) => step.title);

    const parsedBenefits = benefitsRaw
      .split("\n")
      .map((line) => {
        const [title, description] = line.split("|");
        return { title: title?.trim() || "", description: description?.trim() || "" };
      })
      .filter((benefit) => benefit.title);

    const serviceObj: ServiceData = {
      slug,
      name,
      icon: iconName,
      heroTitle,
      heroSubtitle,
      overview,
      whyChooseTitle,
      whyChooseText,
      stats: parsedStats,
      process: parsedProcess,
      benefits: parsedBenefits,
      testimonial: { quote, author },
    };

    if (isEditing) {
      const updated = services.map((service) => (service.slug === isEditing ? serviceObj : service));
      saveToStorage(updated);
      setIsEditing(null);
    } else {
      saveToStorage([...services, serviceObj]);
    }

    resetForm();
  };

  const handleEdit = (service: ServiceData) => {
    setIsEditing(service.slug);
    setSlug(service.slug);
    setName(service.name);
    setIconName(getServiceIconName(service.icon));
    setHeroTitle(service.heroTitle || "");
    setHeroSubtitle(service.heroSubtitle || "");
    setOverview(service.overview || "");
    setWhyChooseTitle(service.whyChooseTitle || "");
    setWhyChooseText(service.whyChooseText || "");

    setStatsRaw(service.stats?.map((stat) => `${stat.label} | ${stat.value}`).join("\n") || "");
    setProcessRaw(service.process?.map((step) => `${step.title} | ${step.description}`).join("\n") || "");
    setBenefitsRaw(service.benefits?.map((benefit) => `${benefit.title} | ${benefit.description}`).join("\n") || "");

    setQuote(service.testimonial?.quote || "");
    setAuthor(service.testimonial?.author || "");
  };

  const handleDelete = (slugToDelete: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      saveToStorage(services.filter((service) => service.slug !== slugToDelete));
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setSlug("");
    setName("");
    setIconName(DEFAULT_SERVICE_ICON);
    setHeroTitle("");
    setHeroSubtitle("");
    setOverview("");
    setWhyChooseTitle("");
    setWhyChooseText("");
    setStatsRaw("");
    setProcessRaw("");
    setBenefitsRaw("");
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
              Complete the service details below. All fields are saved as standard JSON data.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#2DD4BF]/30 bg-[#123832] px-3 py-1 text-xs font-semibold text-[#7FF5DE]">
            {isEditing ? "Editing existing service" : "New service"}
          </span>
        </div>

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
              <input
                id="hero-subtitle"
                type="text"
                placeholder="e.g. Forge a powerful market identity..."
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className={`${fieldClassName} mt-2`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="service-stats" className={labelClassName}>Stats Banner</label>
            <p className={helpTextClassName}>
              Use <code className="rounded bg-black/30 px-1.5 py-0.5 text-[#A7F3D0]">Label | Value</code>, one stat per line.
              Example: Brands Built | 60+
            </p>
            <textarea
              id="service-stats"
              placeholder={"Brands Built | 60+\nClient Retention | 95%\nClient Rating | 4.9★"}
              value={statsRaw}
              onChange={(e) => setStatsRaw(e.target.value)}
              rows={3}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="Main Service Content"
          description="Explain the service clearly in the main overview section."
        >
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
          <div>
            <label htmlFor="service-process" className={labelClassName}>How We Make It Happen Steps</label>
            <p className={helpTextClassName}>
              Use <code className="rounded bg-black/30 px-1.5 py-0.5 text-[#A7F3D0]">Title | Description</code>, one step per line.
            </p>
            <textarea
              id="service-process"
              placeholder={"Brand Discovery | We uncover your core values...\nVisual Identity Creation | We design logos, color palettes..."}
              value={processRaw}
              onChange={(e) => setProcessRaw(e.target.value)}
              rows={5}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="Unfair Advantage"
          description="List the practical advantages and outcomes this service provides."
        >
          <div>
            <label htmlFor="service-benefits" className={labelClassName}>Your Unfair Advantage Benefits</label>
            <p className={helpTextClassName}>
              Use <code className="rounded bg-black/30 px-1.5 py-0.5 text-[#A7F3D0]">Title | Description</code>, one benefit per line.
            </p>
            <textarea
              id="service-benefits"
              placeholder={"Market Differentiation | Stand out instantly...\nCustomer Trust | Project a premium..."}
              value={benefitsRaw}
              onChange={(e) => setBenefitsRaw(e.target.value)}
              rows={5}
              className={`${fieldClassName} mt-2 resize-y`}
            />
          </div>
        </FormSection>

        <FormSection
          title="Testimonial"
          description="Optionally add a client quote and attribution for this service page."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="testimonial-quote" className={labelClassName}>Testimonial Quote</label>
              <p className={helpTextClassName}>Use a concise quote that supports the service outcome.</p>
              <input
                id="testimonial-quote"
                type="text"
                placeholder='e.g. "RaahX gave our business a completely new identity..."'
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className={`${fieldClassName} mt-2`}
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
            className="flex items-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#14B8A6]/10 transition-all hover:bg-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#7FF5DE] focus:ring-offset-2 focus:ring-offset-[#0B241F]"
          >
            {isEditing ? <Check size={16} /> : <Plus size={16} />}
            {isEditing ? "Update Service Detail Page" : "Add Service Detail Page"}
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
                  onClick={() => handleDelete(service.slug)}
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
