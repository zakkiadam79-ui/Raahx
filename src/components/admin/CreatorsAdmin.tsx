import { useEffect, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Check,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  createCreator,
  creatorApiErrorMessage,
  deleteCreator,
  fetchAdminCreator,
  fetchAdminCreators,
  updateCreator,
  type CreatorAdminFilters,
  type CreatorInput,
  type CreatorRecord,
  type CreatorSocialRecord,
} from "../../services/creatorStore";

const fieldClass = "mt-2 w-full rounded-xl border border-white/20 bg-[#071B17] px-4 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/25";
const lightFieldClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
const labelClass = "block text-sm font-semibold text-gray-100";
const helpClass = "mt-1 text-xs leading-relaxed text-gray-400";
const sectionClass = "space-y-5 rounded-2xl border border-white/15 bg-[#102C25]/80 p-5 md:p-6";

const emptySocial = (display_order = 0): CreatorSocialRecord => ({
  platform: "",
  handle: "",
  profile_url: "",
  follower_count: 0,
  display_order,
});

const emptyForm = (): CreatorInput => ({
  name: "",
  slug: "",
  profile_image_url: "",
  short_bio: "",
  about: "",
  category: "",
  city: "",
  region: "",
  followers: 0,
  engagement_rate: 0,
  compatibility_score: null,
  is_verified: false,
  status: "hidden",
  display_order: 0,
  socials: [emptySocial()],
  expertise: [""],
  collaboration_types: [""],
});

function creatorToInput(creator: CreatorRecord): CreatorInput {
  return {
    name: creator.name,
    slug: creator.slug,
    profile_image_url: creator.profile_image_url,
    short_bio: creator.short_bio,
    about: creator.about,
    category: creator.category,
    city: creator.city,
    region: creator.region,
    followers: creator.followers,
    engagement_rate: creator.engagement_rate,
    compatibility_score: creator.compatibility_score,
    is_verified: creator.is_verified,
    status: creator.status,
    display_order: creator.display_order,
    socials: creator.socials.length ? creator.socials.map((social) => ({ ...social })) : [emptySocial()],
    expertise: creator.expertise.length ? [...creator.expertise] : [""],
    collaboration_types: creator.collaboration_types.length ? [...creator.collaboration_types] : [""],
  };
}

function normalizeSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function CreatorsAdmin() {
  const [creators, setCreators] = useState<CreatorRecord[]>([]);
  const [filters, setFilters] = useState<CreatorAdminFilters>({ search: "", status: "", category: "", city: "", sort: "display_order" });
  const [form, setForm] = useState<CreatorInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCreators = async (requestedFilters: CreatorAdminFilters = filters) => {
    setLoading(true);
    setApiError("");
    try {
      setCreators(await fetchAdminCreators(requestedFilters));
    } catch (error) {
      setApiError(creatorApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCreators({ sort: "display_order" });
  }, []);

  const setField = <K extends keyof CreatorInput>(key: K, value: CreatorInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
  };

  const clearForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setSlugEdited(false);
    setFormError("");
  };

  const startEdit = async (creator: CreatorRecord) => {
    setLoadingEdit(true);
    setApiError("");
    setSuccess("");
    try {
      const completeCreator = await fetchAdminCreator(creator.id);
      setForm(creatorToInput(completeCreator));
      setEditingId(completeCreator.id);
      setSlugEdited(true);
      setFormError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setApiError(creatorApiErrorMessage(error));
    } finally {
      setLoadingEdit(false);
    }
  };

  const validatedInput = (): CreatorInput | null => {
    const name = form.name.trim();
    const slug = normalizeSlug(form.slug);
    if (!name) {
      setFormError("Creator name is required.");
      return null;
    }
    if (!slug || slug !== form.slug.trim()) {
      setFormError("Slug must contain lowercase letters, numbers, and single hyphens only.");
      return null;
    }
    if (form.engagement_rate < 0 || form.engagement_rate > 100) {
      setFormError("Engagement rate must be between 0 and 100.");
      return null;
    }
    if (form.compatibility_score !== null && (form.compatibility_score < 0 || form.compatibility_score > 100)) {
      setFormError("Compatibility score must be between 0 and 100.");
      return null;
    }

    const socials = form.socials
      .map((social, index) => ({
        ...social,
        platform: social.platform.trim(),
        handle: social.handle?.trim() || null,
        profile_url: social.profile_url?.trim() || null,
        follower_count: Math.max(0, Number(social.follower_count) || 0),
        display_order: index,
      }))
      .filter((social) => social.platform || social.handle || social.profile_url);
    if (socials.some((social) => !social.platform)) {
      setFormError("Every social account must have a platform name.");
      return null;
    }
    if (new Set(socials.map((social) => social.platform.toLowerCase())).size !== socials.length) {
      setFormError("Each social platform may only be added once.");
      return null;
    }

    return {
      ...form,
      name,
      slug,
      profile_image_url: form.profile_image_url?.trim() || null,
      short_bio: form.short_bio?.trim() || null,
      about: form.about?.trim() || null,
      category: form.category?.trim() || null,
      city: form.city?.trim() || null,
      region: form.region?.trim() || null,
      followers: Math.max(0, Number(form.followers) || 0),
      engagement_rate: Number(form.engagement_rate) || 0,
      compatibility_score: form.compatibility_score === null ? null : Number(form.compatibility_score),
      display_order: Math.max(0, Number(form.display_order) || 0),
      socials,
      expertise: form.expertise.map((value) => value.trim()).filter(Boolean),
      collaboration_types: form.collaboration_types.map((value) => value.trim()).filter(Boolean),
    };
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const input = validatedInput();
    if (!input) return;

    setSaving(true);
    setApiError("");
    setSuccess("");
    try {
      if (editingId) {
        const updated = await updateCreator(editingId, input);
        setCreators((current) => current.map((creator) => creator.id === editingId ? updated : creator));
        setSuccess(`“${updated.name}” was updated successfully.`);
      } else {
        const created = await createCreator(input);
        setCreators((current) => [...current, created]);
        setSuccess(`“${created.name}” was added successfully.`);
      }
      clearForm();
    } catch (error) {
      setApiError(creatorApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (creator: CreatorRecord) => {
    const confirmed = window.confirm(
      `Delete “${creator.name}”?\n\nThis permanently deletes the creator. Because the database uses ON DELETE CASCADE, all social accounts, expertise values, and collaboration types belonging to this creator will also be removed.\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;

    setSaving(true);
    setApiError("");
    setSuccess("");
    try {
      await deleteCreator(creator.id);
      setCreators((current) => current.filter((item) => item.id !== creator.id));
      if (editingId === creator.id) clearForm();
      setSuccess(`“${creator.name}” was deleted.`);
    } catch (error) {
      setApiError(creatorApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (creator: CreatorRecord) => {
    const nextStatus = creator.status === "published" ? "hidden" : "published";
    setSaving(true);
    setApiError("");
    setSuccess("");
    try {
      const updated = await updateCreator(creator.id, { ...creatorToInput(creator), status: nextStatus });
      setCreators((current) => current.map((item) => item.id === creator.id ? updated : item));
      setSuccess(`“${creator.name}” is now ${nextStatus}.`);
    } catch (error) {
      setApiError(creatorApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-white/15 bg-[#0B241F] p-5 text-white shadow-xl md:p-7">
        <div className="flex flex-col gap-4 border-b border-white/15 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7FF5DE]">Creator Network CMS</p>
            <h1 className="mt-2 text-2xl font-bold text-white">{editingId ? "Edit Creator" : "Add Creator"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">Manage Creator profiles, visibility, metrics, social accounts, expertise, and collaboration options.</p>
          </div>
          {editingId ? (
            <button type="button" onClick={clearForm} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><X size={16} /> Cancel edit</button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2DD4BF]/30 bg-[#123832] px-3 py-1.5 text-xs font-semibold text-[#7FF5DE]"><Plus size={14} /> New profile</span>
          )}
        </div>

        {formError && <p role="alert" className="rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">{formError}</p>}
        {apiError && <p role="alert" className="rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">{apiError}</p>}
        {success && <p role="status" className="rounded-xl border border-emerald-300/30 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-100">{success}</p>}

        <FormSection title="Basic information" description="Identity, public URL, profile copy, category, and location.">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Creator name *" help="The public profile heading."><input required value={form.name} onChange={(event) => { const name = event.target.value; setField("name", name); if (!editingId && !slugEdited) setField("slug", normalizeSlug(name)); }} className={fieldClass} /></Field>
            <Field label="URL slug *" help="Lowercase letters, numbers, and hyphens."><input required value={form.slug} onChange={(event) => { setSlugEdited(true); setField("slug", event.target.value); }} placeholder="creator-name" className={fieldClass} /></Field>
            <Field label="Category" help="Primary directory category."><input value={form.category ?? ""} onChange={(event) => setField("category", event.target.value)} placeholder="Lifestyle" className={fieldClass} /></Field>
            <Field label="City"><input value={form.city ?? ""} onChange={(event) => setField("city", event.target.value)} placeholder="Lahore" className={fieldClass} /></Field>
            <Field label="Region"><input value={form.region ?? ""} onChange={(event) => setField("region", event.target.value)} placeholder="Punjab" className={fieldClass} /></Field>
            <Field label="Profile image URL" help="HTTPS or root-relative media URL."><input type="text" value={form.profile_image_url ?? ""} onChange={(event) => setField("profile_image_url", event.target.value)} placeholder="https://..." className={fieldClass} /></Field>
          </div>
          {form.profile_image_url && <img src={form.profile_image_url} alt="Creator preview" className="h-24 w-24 rounded-2xl border border-white/15 object-cover" />}
          <Field label="Short bio"><textarea rows={3} value={form.short_bio ?? ""} onChange={(event) => setField("short_bio", event.target.value)} className={`${fieldClass} resize-y`} /></Field>
          <Field label="Full bio / about"><textarea rows={6} value={form.about ?? ""} onChange={(event) => setField("about", event.target.value)} className={`${fieldClass} resize-y`} /></Field>
        </FormSection>

        <FormSection title="Metrics and visibility" description="Public statistics, verification, publishing state, and directory order.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Followers"><input type="number" min="0" value={form.followers} onChange={(event) => setField("followers", Number(event.target.value))} className={fieldClass} /></Field>
            <Field label="Engagement rate %"><input type="number" min="0" max="100" step="0.01" value={form.engagement_rate} onChange={(event) => setField("engagement_rate", Number(event.target.value))} className={fieldClass} /></Field>
            <Field label="Compatibility score"><input type="number" min="0" max="100" value={form.compatibility_score ?? ""} onChange={(event) => setField("compatibility_score", event.target.value === "" ? null : Number(event.target.value))} className={fieldClass} /></Field>
            <Field label="Display order"><input type="number" min="0" value={form.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} className={fieldClass} /></Field>
            <Field label="Status"><select value={form.status} onChange={(event) => setField("status", event.target.value as CreatorInput["status"])} className={fieldClass}><option value="hidden">Hidden</option><option value="published">Published</option></select></Field>
          </div>
          <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-black/15 px-4 py-3 text-sm font-semibold text-gray-100"><input type="checkbox" checked={form.is_verified} onChange={(event) => setField("is_verified", event.target.checked)} className="h-4 w-4 accent-[#14B8A6]" /> Verified creator</label>
        </FormSection>

        <FormSection title="Social accounts" description="Add each platform once. Platform follower counts can differ from the headline follower total.">
          <div className="space-y-4">
            {form.socials.map((social, index) => (
              <div key={index} className="grid gap-4 rounded-xl border border-white/10 bg-black/15 p-4 md:grid-cols-[1fr_1fr_1.4fr_0.8fr_auto] md:items-end">
                <Field label="Platform"><input value={social.platform} onChange={(event) => setField("socials", form.socials.map((item, itemIndex) => itemIndex === index ? { ...item, platform: event.target.value } : item))} placeholder="Instagram" className={fieldClass} /></Field>
                <Field label="Handle"><input value={social.handle ?? ""} onChange={(event) => setField("socials", form.socials.map((item, itemIndex) => itemIndex === index ? { ...item, handle: event.target.value } : item))} placeholder="@username" className={fieldClass} /></Field>
                <Field label="Profile URL"><input value={social.profile_url ?? ""} onChange={(event) => setField("socials", form.socials.map((item, itemIndex) => itemIndex === index ? { ...item, profile_url: event.target.value } : item))} placeholder="https://..." className={fieldClass} /></Field>
                <Field label="Followers"><input type="number" min="0" value={social.follower_count} onChange={(event) => setField("socials", form.socials.map((item, itemIndex) => itemIndex === index ? { ...item, follower_count: Number(event.target.value) } : item))} className={fieldClass} /></Field>
                <button type="button" onClick={() => setField("socials", form.socials.length === 1 ? [emptySocial()] : form.socials.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove social account ${index + 1}`} className="mb-0.5 rounded-lg p-3 text-red-300 hover:bg-red-500/20"><Trash2 size={17} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setField("socials", [...form.socials, emptySocial(form.socials.length)])} className="inline-flex items-center gap-2 rounded-xl border border-[#2DD4BF]/40 px-4 py-2.5 text-sm font-semibold text-[#7FF5DE] hover:bg-white/10"><Plus size={16} /> Add social account</button>
        </FormSection>

        <FormSection title="Professional information" description="Repeatable expertise and collaboration fields shown on Creator profiles.">
          <div className="grid gap-7 lg:grid-cols-2">
            <TextRepeater title="Expertise" values={form.expertise} placeholder="e.g. Travel" onChange={(values) => setField("expertise", values)} />
            <TextRepeater title="Collaboration types" values={form.collaboration_types} placeholder="e.g. Brand Campaigns" onChange={(values) => setField("collaboration_types", values)} />
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-3 border-t border-white/15 pt-5">
          <button type="button" onClick={clearForm} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10"><X size={16} /> Clear</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0d9488] disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Check size={16} /> : <Plus size={16} />}{saving ? "Saving..." : editingId ? "Update Creator" : "Add Creator"}</button>
        </div>
      </form>

      <section className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-xl font-bold text-secondary">Creator Network</h2><p className="mt-1 text-sm text-gray-500">Search, filter, publish, edit, or remove Creator records.</p></div>
            <button type="button" onClick={() => void loadCreators()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); void loadCreators(); }} className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1fr_auto]">
            <label className="relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input value={filters.search ?? ""} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search creators..." className={`${lightFieldClass} pl-10`} /></label>
            <select value={filters.status ?? ""} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as CreatorAdminFilters["status"] }))} className={lightFieldClass}><option value="">All statuses</option><option value="published">Published</option><option value="hidden">Hidden</option></select>
            <input value={filters.category ?? ""} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className={lightFieldClass} />
            <input value={filters.city ?? ""} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))} placeholder="City" className={lightFieldClass} />
            <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">Apply</button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 text-sm text-gray-500"><Loader2 size={20} className="animate-spin text-primary" /> Loading creators...</div>
        ) : apiError && creators.length === 0 ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"><strong>Creator records could not be loaded.</strong><p className="mt-2">{apiError}</p><p className="mt-2 text-xs">The Creator database migration may still be awaiting approval and execution.</p></div>
        ) : creators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"><UserRound size={38} className="mx-auto text-gray-300" /><h3 className="mt-4 font-bold text-secondary">No creators found</h3><p className="mt-2 text-sm text-gray-500">Adjust the filters or use the Add Creator form above.</p></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => (
              <article key={creator.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex gap-4 p-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gray-100 text-gray-400">{creator.profile_image_url ? <img src={creator.profile_image_url} alt="" className="h-full w-full object-cover" /> : <UserRound size={26} />}</div>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h3 className="truncate font-bold text-secondary">{creator.name}</h3>{creator.is_verified && <BadgeCheck size={16} className="shrink-0 text-primary" />}</div><p className="mt-1 truncate text-xs text-gray-500">/{creator.slug}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${creator.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{creator.status}</span>{creator.category && <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-semibold text-primary">{creator.category}</span>}</div></div>
                </div>
                <div className="grid grid-cols-3 border-y border-gray-100 text-center"><Metric value={creator.followers.toLocaleString()} label="Followers" /><Metric value={`${creator.engagement_rate}%`} label="Engagement" /><Metric value={creator.compatibility_score === null ? "—" : `${creator.compatibility_score}%`} label="Match" /></div>
                <div className="flex items-center justify-end gap-1 p-3">
                  <button type="button" onClick={() => void toggleVisibility(creator)} disabled={saving} title={creator.status === "published" ? "Hide creator" : "Publish creator"} className="rounded-lg p-2.5 text-gray-500 hover:bg-teal-50 hover:text-primary">{creator.status === "published" ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                  <button type="button" onClick={() => void startEdit(creator)} disabled={loadingEdit || saving} title="Edit creator" className="rounded-lg p-2.5 text-gray-500 hover:bg-teal-50 hover:text-primary"><Edit2 size={17} /></button>
                  <button type="button" onClick={() => void handleDelete(creator)} disabled={saving} title="Delete creator" className="rounded-lg p-2.5 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className={sectionClass}><div className="border-b border-white/15 pb-3"><h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#7FF5DE]">{title}</h2><p className="mt-1 text-sm text-gray-300">{description}</p></div>{children}</section>;
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return <label className={labelClass}>{label}{help && <span className={helpClass}>{help}</span>}{children}</label>;
}

function TextRepeater({ title, values, placeholder, onChange }: { title: string; values: string[]; placeholder: string; onChange: (values: string[]) => void }) {
  return <div><h3 className="text-sm font-semibold text-gray-100">{title}</h3><div className="mt-3 space-y-3">{values.map((value, index) => <div key={index} className="flex gap-2"><input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={placeholder} className={`${fieldClass} mt-0`} /><button type="button" onClick={() => onChange(values.length === 1 ? [""] : values.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${title.toLowerCase()} ${index + 1}`} className="rounded-lg p-3 text-red-300 hover:bg-red-500/20"><Trash2 size={16} /></button></div>)}</div><button type="button" onClick={() => onChange([...values, ""])} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#7FF5DE]"><Plus size={14} /> Add {title.toLowerCase()}</button></div>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="border-r border-gray-100 px-2 py-3 last:border-r-0"><strong className="block text-sm text-secondary">{value}</strong><span className="text-[10px] text-gray-400">{label}</span></div>;
}
