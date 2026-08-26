import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, Loader2, LockKeyhole, Save } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CreatorEditableFields, { emptyEditableProfile, type EditableCreatorFields } from "../components/creator-network/CreatorEditableFields";
import { creatorError, requestCreatorAccess, updateCreatorSelf, verifyCreatorAccess, type CreatorRecord, type CreatorSelfInput } from "../services/creatorStore";

export default function CreatorEdit() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [creator, setCreator] = useState<CreatorRecord | null>(null);
  const [form, setForm] = useState<EditableCreatorFields>(emptyEditableProfile());
  const [state, setState] = useState<"loading" | "ready" | "invalid">(token ? "loading" : "invalid");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyCreatorAccess(token).then(({ creator: result }) => {
      if (!active) return;
      setCreator(result);
      setForm({ display_name: result.display_name, email: result.email || "", whatsapp: result.whatsapp || null, profile_image_url: result.profile_image_url, short_bio: result.short_bio, about: result.about, city: result.city, region: result.region, socials: result.socials, categories: result.categories.length ? result.categories : [""], expertise: result.expertise.length ? result.expertise : [""], collaboration_types: result.collaboration_types.length ? result.collaboration_types : [""], featured_work: result.featured_work });
      setState("ready");
    }).catch((failure) => { if (active) { setError(creatorError(failure)); setState("invalid"); } });
    return () => { active = false; };
  }, [token]);

  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!token || saving) return; setSaving(true); setError(""); setSuccess("");
    const profile: CreatorSelfInput = { ...form, categories: form.categories.map((x) => x.trim()).filter(Boolean), expertise: form.expertise.map((x) => x.trim()).filter(Boolean), collaboration_types: form.collaboration_types.map((x) => x.trim()).filter(Boolean), socials: form.socials.filter((x) => x.platform.trim() && x.profile_url.trim()), featured_work: form.featured_work.filter((x) => x.title.trim() && x.work_url.trim()) };
    try { const updated = await updateCreatorSelf(token, profile); setCreator(updated); setSuccess("Your Creator profile was updated successfully."); }
    catch (failure) { setError(creatorError(failure)); }
    finally { setSaving(false); }
  };

  return <main className="min-h-screen bg-surface pt-28"><section className="mx-auto max-w-5xl px-6 py-12 lg:px-8"><div className="mb-8 rounded-3xl bg-[#082f2a] p-7 text-white"><div className="flex items-center gap-3"><LockKeyhole className="text-teal-300" /><div><h1 className="font-heading text-2xl font-bold text-white">Creator Profile Access</h1><p className="mt-1 text-sm text-white/65">Secure magic-link access. This page does not grant Admin permissions.</p></div></div></div>{state === "loading" ? <div className="flex justify-center gap-2 py-24 text-gray-500"><Loader2 className="animate-spin text-primary" /> Verifying your secure link...</div> : state === "invalid" ? <AccessRequest initialError={error} /> : <form onSubmit={save}>{creator && <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900"><BadgeCheck className="mr-2 inline" size={17} /> Editing <strong>{creator.display_name}</strong>. Engagement, verification, visibility, ordering, legal name, and follower override remain Admin controlled.</div>}<CreatorEditableFields value={form} onChange={setForm} />{error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{success && <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}<button disabled={saving} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="animate-spin" /> : <Save />}{saving ? "Saving..." : "Save Profile Changes"}</button></form>}</section></main>;
}

function AccessRequest({ initialError }: { initialError: string }) {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(initialError); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setError(""); try { const result = await requestCreatorAccess(email); setMessage(result.message); } catch (failure) { setError(creatorError(failure)); } finally { setLoading(false); } };
  return <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm"><h2 className="font-heading text-2xl font-bold">Request a new access link</h2><p className="mt-3 text-sm text-gray-500">The link may be invalid or expired. Enter the email associated with your approved Creator profile.</p><form onSubmit={submit} className="mt-6"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="creator@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary" /><button disabled={loading} className="mt-3 w-full rounded-xl bg-primary py-3 font-bold text-white">{loading ? "Requesting..." : "Email Me a Secure Link"}</button></form>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}{message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}</div>;
}
