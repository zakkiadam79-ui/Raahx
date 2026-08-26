import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Check, ExternalLink, Loader2, MapPin, MessageCircle, Users, X } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { creatorError, fetchPublicCreator, fetchPublicCreators, submitCollaborationRequest, type CollaborationRequestInput, type CreatorRecord } from "../services/creatorStore";
import { getDemoCreators } from "../services/creatorDemoAdapter";
import { CREATOR_FALLBACK_IMAGE, getCreatorWorkThumbnail } from "../utils/creatorThumbnails";

const formatCount = (count: number) => count >= 1_000_000 ? `${(count / 1_000_000).toFixed(1).replace(".0", "")}M` : count >= 1_000 ? `${Math.round(count / 1_000)}K` : String(count);

export default function CreatorDetail() {
  const { id = "" } = useParams();
  const [creator, setCreator] = useState<CreatorRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [collaborate, setCollaborate] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(""); setNotFound(false);
      try {
        const result = await fetchPublicCreator(id);
        if (active) setCreator(result);
      } catch (failure) {
        try {
          const real = await fetchPublicCreators();
          if (!active) return;
          if (real.length === 0) {
            const demo = getDemoCreators().find((item) => item.id === id);
            if (demo) setCreator(demo); else setNotFound(true);
          } else setNotFound(true);
        } catch { if (active) setError(creatorError(failure)); }
      } finally { if (active) setLoading(false); }
    };
    void load(); return () => { active = false; };
  }, [id]);

  if (loading) return <main className="grid min-h-screen place-items-center pt-24"><p className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin text-primary" /> Loading Creator...</p></main>;
  if (notFound) return <Navigate to="/creator-network" replace />;
  if (!creator) return <main className="min-h-screen pt-36 text-center"><p className="text-red-600">{error}</p><Link to="/creator-network" className="mt-4 inline-block font-semibold text-primary">Back to Creator Network</Link></main>;

  return (
    <main className="min-h-screen bg-surface pt-24 md:pt-28">
      <section className="border-b border-gray-100 bg-white py-5"><div className="mx-auto max-w-7xl px-6 lg:px-8"><Link to="/creator-network" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"><ArrowLeft size={16} /> Back to all creators</Link></div></section>
      <section className="bg-white py-10 md:py-16"><div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[minmax(280px,420px)_1fr] md:items-center lg:px-8">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-slate-100 shadow-xl md:mx-0"><img src={creator.profile_image_url || "/logo.png"} alt={creator.display_name} width={800} height={1000} onError={(event) => { event.currentTarget.src = "/logo.png"; }} className="h-full w-full object-cover" />{creator.is_verified && <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow"><BadgeCheck size={15} /> Verified Creator</span>}</div>
        <div><div className="flex flex-wrap gap-2">{creator.categories.map((tag) => <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{tag}</span>)}</div><h1 className="mt-5 font-heading text-4xl font-bold text-secondary md:text-5xl">{creator.display_name}</h1><p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500"><MapPin size={16} className="text-primary" /> {creator.city || "Location not listed"}{creator.region ? `, ${creator.region}` : ""}</p><p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">{creator.short_bio || "Creator profile"}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={() => setCollaborate(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark">Collaborate With Creator <ArrowRight size={16} /></button><Link to="/proposal" className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-secondary hover:border-primary">Talk to RaahX Team</Link></div><div className="mt-9 grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-100"><Metric icon={Users} value={`${formatCount(creator.followers)}+`} label="Followers" /><Metric icon={BarChart3} value={`${creator.engagement_rate}%`} label="Engagement" /><Metric icon={MapPin} value={creator.city || "—"} label="City" /></div></div>
      </div></section>
      <section className="py-14 md:py-20"><div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_380px] lg:px-8"><div className="space-y-8">
        <Section title="About the Creator"><p className="leading-8 text-gray-600">{creator.about || "More information will be added soon."}</p></Section>
        <Section title="Content Expertise"><div className="flex flex-wrap gap-2">{creator.expertise.length ? creator.expertise.map((tag) => <span key={tag} className="rounded-full border border-primary/15 bg-teal-50 px-4 py-2 text-sm font-medium text-primary">{tag}</span>) : <p className="text-sm text-gray-500">No expertise listed yet.</p>}</div></Section>
        <Section title="Featured Work"><div className="grid gap-5 sm:grid-cols-2">{creator.featured_work.length ? creator.featured_work.map((work, index) => <a key={`${work.work_url}-${index}`} href={work.work_url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border border-gray-100 bg-surface"><div className="h-40 bg-teal-50"><img src={getCreatorWorkThumbnail(work)} alt={`${work.title} thumbnail`} loading="lazy" onError={(event) => { event.currentTarget.src = CREATOR_FALLBACK_IMAGE; }} className="h-full w-full object-cover" /></div><div className="p-4"><p className="text-xs font-semibold text-primary">{work.platform || "Featured work"}</p><h3 className="mt-1 flex items-center gap-2 font-bold text-secondary group-hover:text-primary">{work.title}<ExternalLink size={14} /></h3></div></a>) : <p className="text-sm text-gray-500">No featured work has been added yet.</p>}</div></Section>
        <Section title="Why Brands Love Working With This Creator"><div className="grid gap-4 sm:grid-cols-2">{["Authentic content", "Engaged community", "Professional approach", "Creative storytelling"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-surface p-4 text-sm font-semibold text-gray-700"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary"><Check size={14} /></span>{item}</div>)}</div></Section>
      </div><aside className="space-y-6"><div className="rounded-3xl bg-[#082f2a] p-7 text-white"><h2 className="font-heading text-xl font-bold text-white">Social Presence</h2><div className="mt-6 space-y-3">{creator.socials.length ? creator.socials.map((social, index) => <a key={`${social.profile_url}-${index}`} href={social.profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4 hover:bg-white/15"><span className="min-w-0"><strong className="block text-sm text-white">{social.platform}</strong><span className="block truncate text-xs text-white/60">{social.handle || social.profile_url}</span><span className="mt-1 block text-xs text-teal-200">{formatCount(social.follower_count)} followers</span></span><ExternalLink size={17} /></a>) : <p className="text-sm text-white/60">No social profiles listed.</p>}</div></div><div className="rounded-3xl border border-primary/15 bg-white p-7 shadow-lg"><MessageCircle className="text-primary" /><h2 className="mt-4 font-heading text-xl font-bold">Start a collaboration</h2><p className="mt-3 text-sm text-gray-500">Share your campaign goals with this Creator and RaahX.</p><button onClick={() => setCollaborate(true)} className="mt-6 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Collaborate With Creator</button></div></aside></div></section>
      {collaborate && <CollaborationDialog creator={creator} onClose={() => setCollaborate(false)} />}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <article className="rounded-3xl border border-gray-100 bg-white p-6 md:p-9"><h2 className="mb-5 font-heading text-2xl font-bold text-secondary">{title}</h2>{children}</article>; }
function Metric({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) { return <div className="border-r border-gray-100 p-4 text-center last:border-r-0"><Icon size={17} className="mx-auto mb-2 text-primary" /><strong className="block truncate font-heading text-lg text-secondary">{value}</strong><span className="text-[10px] text-gray-500 sm:text-xs">{label}</span></div>; }

function CollaborationDialog({ creator, onClose }: { creator: CreatorRecord; onClose: () => void }) {
  const empty: CollaborationRequestInput = { creator_id: creator.id, requester_name: "", company_name: null, email: "", whatsapp: null, campaign_type: null, campaign_budget: null, campaign_details: "", portfolio_url: null };
  const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (saving) return; setSaving(true); setError(""); try { await submitCollaborationRequest(form); setSuccess(true); } catch (failure) { setError(creatorError(failure)); } finally { setSaving(false); } };
  const set = (key: keyof CollaborationRequestInput, value: string) => setForm((current) => ({ ...current, [key]: value || null }));
  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/60 p-4"><div className="mx-auto my-8 max-w-2xl rounded-3xl bg-white p-6 shadow-2xl md:p-8"><div className="flex justify-between"><div><h2 className="font-heading text-2xl font-bold">Collaborate with {creator.display_name}</h2><p className="mt-1 text-sm text-gray-500">Your request will be sent to the Creator and RaahX.</p></div><button onClick={onClose} aria-label="Close"><X /></button></div>{success ? <div className="py-16 text-center"><BadgeCheck className="mx-auto text-primary" size={44} /><h3 className="mt-4 text-xl font-bold">Your collaboration request has been sent successfully.</h3><button onClick={onClose} className="mt-6 rounded-full bg-primary px-6 py-3 font-bold text-white">Close</button></div> : <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><Input label="Your Name *" value={form.requester_name} onChange={(v) => set("requester_name", v)} required /><Input label="Company / Brand" value={form.company_name || ""} onChange={(v) => set("company_name", v)} /><Input label="Email Address *" type="email" value={form.email} onChange={(v) => set("email", v)} required /><Input label="WhatsApp Number" value={form.whatsapp || ""} onChange={(v) => set("whatsapp", v)} /><Input label="Campaign Type" value={form.campaign_type || ""} onChange={(v) => set("campaign_type", v)} /><Input label="Campaign Budget" value={form.campaign_budget || ""} onChange={(v) => set("campaign_budget", v)} /><div className="sm:col-span-2"><Input label="Portfolio / Work Link" value={form.portfolio_url || ""} onChange={(v) => set("portfolio_url", v)} placeholder="https://" /></div><label className="sm:col-span-2 text-sm font-semibold">Campaign Details *<textarea required rows={5} value={form.campaign_details} onChange={(event) => set("campaign_details", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-primary" placeholder="Tell the Creator about your campaign, deliverables, and timeline." /></label>{error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}<button disabled={saving} className="sm:col-span-2 rounded-xl bg-primary py-3.5 font-bold text-white disabled:opacity-60">{saving ? "Sending..." : "Send Collaboration Request"}</button></form>}</div></div>;
}
function Input({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) { return <label className="text-sm font-semibold">{label}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-primary" /></label>; }
