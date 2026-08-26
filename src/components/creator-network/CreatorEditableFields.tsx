import { useState } from "react";
import { HelpCircle, Info, Plus, Trash2 } from "lucide-react";
import type { CreatorFeaturedWork, CreatorSocialRecord } from "../../services/creatorStore";

export interface EditableCreatorFields {
  full_name?: string;
  display_name: string;
  email: string;
  whatsapp: string | null;
  profile_image_url: string | null;
  short_bio: string | null;
  about: string | null;
  city: string | null;
  region: string | null;
  socials: CreatorSocialRecord[];
  categories: string[];
  expertise: string[];
  collaboration_types: string[];
  featured_work: CreatorFeaturedWork[];
}

const input = "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
const emptySocial = (index: number): CreatorSocialRecord => ({ platform: "", handle: "", profile_url: "", follower_count: 0, display_order: index });
const emptyWork = (index: number): CreatorFeaturedWork => ({ title: "", work_url: "", platform: "", thumbnail_url: null, display_order: index });

export default function CreatorEditableFields<T extends EditableCreatorFields>({ value, onChange, showFullName = false }: { value: T; onChange: (value: T) => void; showFullName?: boolean }) {
  const [imageHelpOpen, setImageHelpOpen] = useState(false);
  const set = <K extends keyof T>(key: K, next: T[K]) => onChange({ ...value, [key]: next });
  return <div className="space-y-8">
    <FormSection title="Basic Information">
      <div className="grid gap-5 md:grid-cols-2">
        {showFullName && <Field label="Full Name *" hint="Your legal/full name used for the application."><input required value={value.full_name || ""} onChange={(e) => set("full_name" as keyof T, e.target.value as T[keyof T])} placeholder="Your full legal name" className={input} /></Field>}
        <Field label="Creator Display Name *" hint="The public name shown on your Creator profile."><input required value={value.display_name} onChange={(e) => set("display_name", e.target.value as T["display_name"])} placeholder="Your creator or channel name" className={input} /></Field>
        <Field label="Email *" hint="Required for Creator communication and secure profile access."><input required type="email" value={value.email} onChange={(e) => set("email", e.target.value as T["email"])} placeholder="creator@example.com" className={input} /></Field>
        <Field label="WhatsApp" hint="Include your country code."><input value={value.whatsapp || ""} onChange={(e) => set("whatsapp", (e.target.value || null) as T["whatsapp"])} placeholder="+92 300 0000000" className={input} /></Field>
        <Field label="City" hint="Free text: Lahore, Dubai, London, New York, or any city."><input value={value.city || ""} onChange={(e) => set("city", (e.target.value || null) as T["city"])} placeholder="Your city" className={input} /></Field>
        <Field label="Region / Country"><input value={value.region || ""} onChange={(e) => set("region", (e.target.value || null) as T["region"])} placeholder="Punjab, Pakistan" className={input} /></Field>
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="creator-profile-image-url" className="text-sm font-semibold text-gray-700">Profile Image URL</label>
          <button
            type="button"
            onClick={() => setImageHelpOpen((open) => !open)}
            aria-expanded={imageHelpOpen}
            aria-controls="creator-profile-image-help"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-teal-50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-teal-100"
          >
            <HelpCircle size={14} /> Help
          </button>
        </div>
        <input id="creator-profile-image-url" type="url" value={value.profile_image_url || ""} onChange={(e) => set("profile_image_url", (e.target.value || null) as T["profile_image_url"])} placeholder="https://example.com/public-photo.jpg" className={input} />
        <p className="mt-1 text-xs leading-relaxed text-gray-500">Paste a publicly accessible HTTP/HTTPS image URL. Image uploads are not used.</p>
        {imageHelpOpen && (
          <div id="creator-profile-image-help" role="note" className="mt-3 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm leading-relaxed text-teal-950">
            <p className="font-semibold text-primary">How to add your profile photo</p>
            <p className="mt-1">Upload your profile photo to Google Drive or another publicly accessible image location. Make sure anyone with the shared link can view it, then paste the public image URL here. The link must be publicly accessible and point to the image.</p>
          </div>
        )}
      </div>
      <Field label="Short Bio" hint="Appears under your name and categories in the profile hero."><textarea rows={3} value={value.short_bio || ""} onChange={(e) => set("short_bio", (e.target.value || null) as T["short_bio"])} placeholder="A short introduction to your content and audience." className={input} /></Field>
      <Field label="Full Bio / About" hint="Appears in the About the Creator section."><textarea rows={6} value={value.about || ""} onChange={(e) => set("about", (e.target.value || null) as T["about"])} placeholder="Tell brands about your work, audience, style, and experience." className={input} /></Field>
    </FormSection>

    <FormSection title="Categories"><StringRepeater values={value.categories} placeholder="e.g. Travel" addLabel="Add another category" onChange={(next) => set("categories", next as T["categories"])} /></FormSection>

    <FormSection title="Social Media Accounts" hint="Add every account you want shown. Profile URL must be the exact public destination.">
      <div className="space-y-4">{value.socials.map((social, index) => <div key={index} className="grid gap-3 rounded-2xl border border-gray-100 bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr_0.8fr_auto] lg:items-end"><Field label="Platform"><input required value={social.platform} onChange={(e) => updateSocial(index, { platform: e.target.value })} placeholder="Instagram, YouTube, Other" className={input} /></Field><Field label="Username / Handle"><input value={social.handle || ""} onChange={(e) => updateSocial(index, { handle: e.target.value || null })} placeholder="@username" className={input} /></Field><Field label="Profile URL *" hint="Exact clickable profile URL."><input required type="url" value={social.profile_url} onChange={(e) => updateSocial(index, { profile_url: e.target.value })} placeholder="https://" className={input} /></Field><Field label="Followers" hint="Used to calculate your total."><input type="number" min="0" value={social.follower_count} onChange={(e) => updateSocial(index, { follower_count: Number(e.target.value) || 0 })} className={input} /></Field><Remove onClick={() => set("socials", (value.socials.length === 1 ? [emptySocial(0)] : value.socials.filter((_, i) => i !== index).map((item, i) => ({ ...item, display_order: i }))) as T["socials"])} label="Remove social account" /></div>)}</div>
      <Add onClick={() => set("socials", [...value.socials, emptySocial(value.socials.length)] as T["socials"])} label="Add another social media account" />
    </FormSection>

    <FormSection title="Expertise"><StringRepeater values={value.expertise} placeholder="e.g. Photography" addLabel="Add another expertise" onChange={(next) => set("expertise", next as T["expertise"])} /></FormSection>
    <FormSection title="Available For / Collaboration Types"><StringRepeater values={value.collaboration_types} placeholder="e.g. Reels & Short Videos" addLabel="Add another collaboration type" onChange={(next) => set("collaboration_types", next as T["collaboration_types"])} /></FormSection>

    <FormSection title="Featured Work / Portfolio" hint="Paste links to public work or videos. Supported YouTube links receive a safe platform thumbnail automatically; other platforms use the RaahX fallback image when no thumbnail is available. Your exact work URL is never changed.">
      <div className="space-y-4">{value.featured_work.map((work, index) => <div key={index} className="grid gap-3 rounded-2xl border border-gray-100 bg-slate-50 p-4 md:grid-cols-[1fr_1.5fr_1fr_auto] md:items-end"><Field label="Title"><input required value={work.title} onChange={(e) => updateWork(index, { title: e.target.value })} placeholder="Campaign or video title" className={input} /></Field><Field label="Work / Video URL"><input required type="url" value={work.work_url} onChange={(e) => updateWork(index, { work_url: e.target.value })} placeholder="https://" className={input} /></Field><Field label="Platform"><input value={work.platform || ""} onChange={(e) => updateWork(index, { platform: e.target.value || null })} placeholder="YouTube, TikTok, Other" className={input} /></Field><Remove onClick={() => set("featured_work", (value.featured_work.length === 1 ? [emptyWork(0)] : value.featured_work.filter((_, i) => i !== index).map((item, i) => ({ ...item, display_order: i }))) as T["featured_work"])} label="Remove work" /></div>)}</div>
      <Add onClick={() => set("featured_work", [...value.featured_work, emptyWork(value.featured_work.length)] as T["featured_work"])} label="Add another work" />
    </FormSection>
  </div>;

  function updateSocial(index: number, changes: Partial<CreatorSocialRecord>) { set("socials", value.socials.map((item, i) => i === index ? { ...item, ...changes } : item) as T["socials"]); }
  function updateWork(index: number, changes: Partial<CreatorFeaturedWork>) { set("featured_work", value.featured_work.map((item, i) => i === index ? { ...item, ...changes } : item) as T["featured_work"]); }
}

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) { return <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 md:p-7"><div><h2 className="font-heading text-lg font-bold text-secondary">{title}</h2>{hint && <p className="mt-1 text-xs leading-relaxed text-gray-500">{hint}</p>}</div>{children}</section>; }
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-gray-700">{label}{hint && <span className="mt-1 flex items-start gap-1 text-xs font-normal leading-relaxed text-gray-500"><Info size={13} className="mt-0.5 shrink-0" />{hint}</span>}{children}</label>; }
function Add({ onClick, label }: { onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl border border-primary/25 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-teal-50"><Plus size={16} /> {label}</button>; }
function Remove({ onClick, label }: { onClick: () => void; label: string }) { return <button type="button" onClick={onClick} aria-label={label} className="rounded-xl p-3 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button>; }
function StringRepeater({ values, placeholder, addLabel, onChange }: { values: string[]; placeholder: string; addLabel: string; onChange: (values: string[]) => void }) { return <div className="space-y-3">{values.map((value, index) => <div key={index} className="flex gap-2"><input value={value} onChange={(e) => onChange(values.map((item, i) => i === index ? e.target.value : item))} placeholder={placeholder} className={input} /><Remove onClick={() => onChange(values.length === 1 ? [""] : values.filter((_, i) => i !== index))} label={`Remove ${placeholder}`} /></div>)}<Add onClick={() => onChange([...values, ""])} label={addLabel} /></div>; }

export const emptyEditableProfile = (): EditableCreatorFields => ({ display_name: "", email: "", whatsapp: null, profile_image_url: null, short_bio: null, about: null, city: null, region: null, socials: [{ platform: "", handle: "", profile_url: "", follower_count: 0, display_order: 0 }], categories: [""], expertise: [""], collaboration_types: [""], featured_work: [] });
