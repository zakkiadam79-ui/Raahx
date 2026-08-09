import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { servicesData as defaultServices, ServiceData } from "../../data/servicesData";

const STORAGE_KEY = "raahx_services_data";

const ICON_OPTIONS = [
  "Megaphone",
  "Share2",
  "Search",
  "MonitorSmartphone",
  "Palette",
  "Target",
  "Cpu",
  "PenTool",
  "Briefcase",
  "Code2",
];

export default function ServicesAdmin() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Core Service Fields
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("Megaphone");
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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setServices(JSON.parse(saved));
    } else {
      setServices(defaultServices);
    }
  }, []);

  const saveToStorage = (updated: ServiceData[]) => {
    setServices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    // Parse array inputs
    const parsedStats = statsRaw
      .split("\n")
      .map((line) => {
        const [label, value] = line.split("|");
        return { label: label?.trim() || "", value: value?.trim() || "" };
      })
      .filter((s) => s.label && s.value);

    const parsedProcess = processRaw
      .split("\n")
      .map((line) => {
        const [title, description] = line.split("|");
        return { title: title?.trim() || "", description: description?.trim() || "" };
      })
      .filter((p) => p.title);

    const parsedBenefits = benefitsRaw
      .split("\n")
      .map((line) => {
        const [title, description] = line.split("|");
        return { title: title?.trim() || "", description: description?.trim() || "" };
      })
      .filter((b) => b.title);

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
    } as any;

    if (isEditing) {
      const updated = services.map((s) => (s.slug === isEditing ? serviceObj : s));
      saveToStorage(updated);
      setIsEditing(null);
    } else {
      saveToStorage([...services, serviceObj]);
    }

    resetForm();
  };

  const handleEdit = (service: any) => {
    setIsEditing(service.slug);
    setSlug(service.slug);
    setName(service.name);
    setIconName(typeof service.icon === "string" ? service.icon : "Megaphone");
    setHeroTitle(service.heroTitle || "");
    setHeroSubtitle(service.heroSubtitle || "");
    setOverview(service.overview || "");
    setWhyChooseTitle(service.whyChooseTitle || "");
    setWhyChooseText(service.whyChooseText || "");

    setStatsRaw(service.stats?.map((s: any) => `${s.label} | ${s.value}`).join("\n") || "");
    setProcessRaw(service.process?.map((p: any) => `${p.title} | ${p.description}`).join("\n") || "");
    setBenefitsRaw(service.benefits?.map((b: any) => `${b.title} | ${b.description}`).join("\n") || "");

    setQuote(service.testimonial?.quote || "");
    setAuthor(service.testimonial?.author || "");
  };

  const handleDelete = (slugToDelete: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const updated = services.filter((s) => s.slug !== slugToDelete);
      saveToStorage(updated);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setSlug("");
    setName("");
    setIconName("Megaphone");
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

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddOrUpdate} className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-5">
        <h3 className="text-lg font-bold text-white mb-2">
          {isEditing ? "Edit Service Detail Page" : "Add New Service Detail Page"}
        </h3>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Service Name</label>
            <input
              type="text"
              placeholder="e.g. Branding Services"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
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
              placeholder="e.g. branding-services"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Lucide Icon</label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            >
              {ICON_OPTIONS.map((icon) => (
                <option key={icon} value={icon} className="bg-[#123832]">
                  {icon}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hero Title Tagline</label>
            <input
              type="text"
              placeholder="e.g. Create a Brand That Customers Trust and Remember"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hero Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Forge a powerful market identity..."
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        {/* Stats Banner */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Stats Banner (Format: Label | Value — One per line)</label>
          <textarea
            placeholder={"Brands Built | 60+\nClient Retention | 95%\nClient Rating | 4.9★"}
            value={statsRaw}
            onChange={(e) => setStatsRaw(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        {/* Overview Paragraph */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Main Service Overview Paragraph</label>
          <textarea
            placeholder="Strong brands create lasting impressions..."
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        {/* Why Choose Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Why Choose Section Title</label>
            <input
              type="text"
              placeholder="e.g. Why Choose Our Branding Services"
              value={whyChooseTitle}
              onChange={(e) => setWhyChooseTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Why Choose Section Text</label>
            <textarea
              placeholder="A memorable brand creates trust..."
              value={whyChooseText}
              onChange={(e) => setWhyChooseText(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        {/* Process & Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">How We Make It Happen Steps (Title | Description)</label>
            <textarea
              placeholder={"Brand Discovery | We uncover your core values...\nVisual Identity Creation | We design logos, color palettes..."}
              value={processRaw}
              onChange={(e) => setProcessRaw(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Your Unfair Advantage Benefits (Title | Description)</label>
            <textarea
              placeholder={"Market Differentiation | Stand out instantly...\nCustomer Trust | Project a premium..."}
              value={benefitsRaw}
              onChange={(e) => setBenefitsRaw(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        {/* Testimonial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Testimonial Quote</label>
            <input
              type="text"
              placeholder='e.g. "RaahX gave our business a completely new identity..."'
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Testimonial Author</label>
            <input
              type="text"
              placeholder="e.g. Usman Tariq"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold rounded-xl transition-all text-sm"
          >
            {isEditing ? <Check size={16} /> : <Plus size={16} />}
            {isEditing ? "Update Service Detail Page" : "Add Service Detail Page"}
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

      {/* Services List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.slug} className="p-4 bg-black/20 border border-white/10 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white text-sm">{service.name}</h4>
              <p className="text-xs text-[#2DD4BF]">/services/{service.slug}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(service)} className="p-2 hover:bg-white/10 text-gray-300 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(service.slug)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}