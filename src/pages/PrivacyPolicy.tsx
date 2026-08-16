import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Information you may provide",
    body: "If you contact RaahX through the proposal form or another contact mechanism, you may provide information such as your name, company name, business email, phone number, website, industry, requested services, budget, timeline, and project details. If you subscribe to the Blog newsletter, your email address may be collected for that purpose.",
  },
  {
    title: "How information is used",
    body: "We use submitted information to review inquiries, respond to questions, prepare proposals, communicate about requested services, improve the website experience, and send newsletter updates when you choose to subscribe. We do not use submitted information to make guarantees about marketing outcomes.",
  },
  {
    title: "Website storage and technical information",
    body: "This application currently uses browser localStorage for some content-management fallback data, including service, Team, Blog, and Case Study data during the transition to the PHP/MySQL architecture. Normal hosting and server operations may also process basic technical request information such as an IP address, browser details, or request time. The website does not currently include a separate analytics or advertising-pixel system in its application code.",
  },
  {
    title: "Cookies and sessions",
    body: "The private Admin area uses server-managed HTTP-only session cookies for authentication. These cookies are not used to provide public visitors with an account. The public website does not require visitors to log in.",
  },
  {
    title: "Third-party services",
    body: "The website may rely on hosting, email, database, map, social-media, and infrastructure services that are part of the deployed site or linked from it. We do not claim that a particular analytics, advertising, payment, or marketing platform is active unless it is actually configured for the deployment.",
  },
  {
    title: "Data security and retention",
    body: "We take reasonable steps to protect information submitted through the website and limit access to people who need it for responding to inquiries or operating the business. Information may be retained for as long as reasonably necessary to respond, provide services, maintain business records, resolve disputes, or meet applicable obligations.",
  },
  {
    title: "Your choices and rights",
    body: "You may contact us to ask what contact information we hold about you, request correction of inaccurate information, ask about deletion where appropriate, or unsubscribe from newsletter communications. Some records may need to be retained for legitimate business, legal, or security reasons.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this Privacy Policy when the website, services, or applicable requirements change. The updated version will be published on this page with a revised date.",
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-body md:pt-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-body shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to RaahX
        </Link>

        <header className="mb-12 rounded-3xl bg-secondary p-8 text-white shadow-xl md:p-12">
          <ShieldCheck className="mb-5 text-primary" size={32} aria-hidden="true" />
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">RaahX</p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">Privacy Policy</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-gray-300">
            This page explains how information may be handled when you visit RaahX or contact us about digital growth services.
          </p>
          <p className="mt-6 text-sm text-gray-400">Last updated: August 9, 2026</p>
        </header>

        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-100 bg-surface p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold text-secondary">Introduction</h2>
            <p className="mt-3 leading-relaxed text-body">
              RaahX respects your privacy. This Privacy Policy applies to information handled through the RaahX website and explains the practical data flows currently supported by the site.
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-heading text-2xl font-bold text-secondary">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-body">{section.body}</p>
            </section>
          ))}

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold text-secondary">Contact RaahX</h2>
            <p className="mt-3 leading-relaxed text-body">
              For privacy questions, requests, or concerns, email{" "}
              <a href="mailto:hello@raahx.com" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark">
                hello@raahx.com
              </a>.
            </p>
          </section>

          <p className="pt-4 text-sm leading-relaxed text-gray-500">
            This is general website information and is not legal advice. RaahX should have this policy reviewed by an appropriate legal professional before production use or reliance for a particular jurisdiction.
          </p>
        </div>
      </div>
    </main>
  );
}
