import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { creatorCategories, creatorCities } from "../data/creatorsData";

export default function CreatorJoin() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-surface pt-24 md:pt-28">
      <section className="bg-[#082f2a] py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-teal-100"><BadgeCheck size={15} /> CREATOR REGISTRATION</span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-white md:text-5xl">Join the RaahX Creator Network</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">Get discovered by brands and businesses looking for authentic creators across Pakistan.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {submitted ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm md:p-12">
              <CheckCircle2 size={52} className="mx-auto text-primary" />
              <h2 className="mt-5 font-heading text-2xl font-bold text-secondary">Profile details received</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">This frontend-only preview keeps your submission in the current page session. No information has been sent to a server or database.</p>
              <Link to="/creator-network" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">Explore creators <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <>
              <Link to="/creator-network" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"><ArrowLeft size={16} /> Back to creator network</Link>
              <form onSubmit={submit} className="space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">
                <FormSection title="Personal information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name"><input required name="fullName" className={inputClass} placeholder="Your legal name" /></Field>
                    <Field label="Creator display name"><input required name="displayName" className={inputClass} placeholder="Name shown on your profile" /></Field>
                    <Field label="Email address"><input required type="email" name="email" className={inputClass} placeholder="you@example.com" /></Field>
                    <Field label="WhatsApp number"><input required type="tel" name="phone" className={inputClass} placeholder="+92 300 0000000" /></Field>
                    <Field label="City"><select required name="city" className={inputClass}><option value="">Select city</option>{creatorCities.map((city) => <option key={city}>{city}</option>)}</select></Field>
                    <Field label="Primary category"><select required name="category" className={inputClass}><option value="">Select category</option>{creatorCategories.map((category) => <option key={category}>{category}</option>)}</select></Field>
                  </div>
                </FormSection>

                <FormSection title="Social profiles & audience">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Instagram username"><input required name="instagram" className={inputClass} placeholder="@username" /></Field>
                    <Field label="Instagram followers"><input required min="0" type="number" name="followers" className={inputClass} placeholder="e.g. 25000" /></Field>
                    <Field label="TikTok profile (optional)"><input name="tiktok" className={inputClass} placeholder="@username or link" /></Field>
                    <Field label="YouTube channel (optional)"><input name="youtube" className={inputClass} placeholder="Channel link" /></Field>
                  </div>
                </FormSection>

                <FormSection title="Tell brands about your work">
                  <Field label="Short creator bio"><textarea required name="bio" rows={4} className={inputClass} placeholder="Describe your content, audience and creative style..." /></Field>
                  <div className="mt-5"><Field label="Portfolio or best content links"><textarea name="portfolio" rows={3} className={inputClass} placeholder="Add one link per line" /></Field></div>
                </FormSection>

                <label className="flex items-start gap-3 rounded-2xl bg-teal-50 p-4 text-sm leading-relaxed text-gray-600">
                  <input required type="checkbox" className="mt-1 h-4 w-4 accent-primary" />
                  I confirm that the information provided is accurate and may be reviewed for a public RaahX creator profile.
                </label>
                <div className="flex items-start gap-3 text-xs text-gray-500"><ShieldCheck size={18} className="shrink-0 text-primary" /> This stage is a frontend demonstration only. The form does not call an API or store data.</div>
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-primary-dark">Submit creator profile <ArrowRight size={16} /></button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const inputClass = "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset><legend className="mb-5 font-heading text-lg font-bold text-secondary">{title}</legend>{children}</fieldset>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700">{label}{children}</label>;
}
