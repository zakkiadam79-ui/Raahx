import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import CreatorEditableFields, { emptyEditableProfile, type EditableCreatorFields } from "../components/creator-network/CreatorEditableFields";
import { creatorError, submitCreatorApplication, type CreatorApplicationInput } from "../services/creatorStore";

export default function CreatorJoin() {
  const [form, setForm] = useState<EditableCreatorFields & { full_name: string }>({ ...emptyEditableProfile(), full_name: "" });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (saving) return; setSaving(true); setError("");
    const payload: CreatorApplicationInput = {
      ...form,
      categories: form.categories.map((item) => item.trim()).filter(Boolean),
      expertise: form.expertise.map((item) => item.trim()).filter(Boolean),
      collaboration_types: form.collaboration_types.map((item) => item.trim()).filter(Boolean),
      featured_work: form.featured_work.filter((item) => item.title.trim() && item.work_url.trim()),
      socials: form.socials.filter((item) => item.platform.trim() && item.profile_url.trim()),
    };
    try { await submitCreatorApplication(payload); setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (failure) { setError(creatorError(failure)); }
    finally { setSaving(false); }
  };

  return <main className="min-h-screen bg-surface pt-24 md:pt-28">
    <section className="bg-[#082f2a] py-14 text-white md:py-20"><div className="mx-auto max-w-4xl px-6 text-center"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-teal-100"><BadgeCheck size={15} /> CREATOR APPLICATION</span><h1 className="mt-5 font-heading text-4xl font-bold text-white md:text-5xl">Join the RaahX Creator Network</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">Submit your profile for review. Applications remain pending until approved by the RaahX team.</p></div></section>
    <section className="py-12 md:py-16"><div className="mx-auto max-w-5xl px-6 lg:px-8">
      {submitted ? <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm"><CheckCircle2 size={52} className="mx-auto text-primary" /><h2 className="mt-5 font-heading text-2xl font-bold">Application received</h2><p className="mx-auto mt-3 max-w-2xl text-gray-500">Thank you for applying to become a RaahX Creator. Our team will review your information and contact you soon.</p><Link to="/creator-network" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">Explore Creators <ArrowRight size={16} /></Link></div> : <><Link to="/creator-network" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"><ArrowLeft size={16} /> Back to Creator Network</Link><form onSubmit={submit}><CreatorEditableFields value={form} onChange={setForm} showFullName uploadMode="application" />{error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}<button disabled={saving} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}{saving ? "Submitting Application..." : "Submit Application"}</button></form></>}
    </div></section>
  </main>;
}
