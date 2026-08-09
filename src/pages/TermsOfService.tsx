import { Link } from "react-router-dom";
import { ArrowLeft, FileCheck2 } from "lucide-react";

const sections = [
  {
    title: "Use of this website",
    body: "You may use the RaahX website for lawful, informational, and business purposes. Please do not misuse the website, attempt to disrupt its operation, access restricted areas without authorization, or submit information that is unlawful, misleading, or harmful.",
  },
  {
    title: "Services information",
    body: "The Services, Blog, Team, and Case Studies sections describe RaahX's current capabilities and examples of work. Website content is provided for general information and may change as our services, processes, or availability develop.",
  },
  {
    title: "Client inquiries and proposals",
    body: "Submitting a proposal or inquiry does not create a client relationship, engagement, or obligation for RaahX to accept a project. Any work, deliverables, fees, timelines, responsibilities, and rights will be governed by a separate written agreement when both parties agree to proceed.",
  },
  {
    title: "Information you provide",
    body: "You are responsible for ensuring that information submitted through the website is accurate, lawful, and appropriate to share. Do not submit confidential information that you do not have permission to provide. We may use inquiry details to understand your requirements and respond to your request.",
  },
  {
    title: "Intellectual property",
    body: "Unless otherwise stated, the RaahX website, branding, text, graphics, interface, and original materials are owned by or used with permission by RaahX. You may not copy, republish, modify, distribute, or commercially exploit website materials without appropriate permission. Client work and deliverable ownership are handled in the applicable client agreement.",
  },
  {
    title: "Third-party links and services",
    body: "The website may contain links to third-party websites or social profiles. These links are provided for convenience, and RaahX does not control or guarantee third-party content, availability, security, or policies. Third-party services used in a particular project will be discussed and agreed as appropriate.",
  },
  {
    title: "Marketing results and no guarantee",
    body: "Digital marketing outcomes vary according to industry, competition, budget, implementation, market conditions, starting position, and many factors outside RaahX's control. The website does not promise guaranteed rankings, sales, leads, revenue, engagement, or any specific marketing result. Any projections or targets must be treated as planning estimates unless expressly agreed in writing.",
  },
  {
    title: "Availability and limitation of liability",
    body: "We aim to keep the website useful and available, but we do not guarantee that it will always be uninterrupted, error-free, or free of harmful components. To the extent permitted by applicable law, RaahX will not be responsible for indirect or consequential losses arising from use of the website or reliance on general website information. Specific client engagements are governed by their own agreements.",
  },
  {
    title: "Changes to the website and these terms",
    body: "RaahX may update, suspend, or change website content, services, features, or these Terms of Service. Updated terms will be published on this page with a revised date. Continued use of the website after an update indicates that you have reviewed the updated terms to the extent permitted by law.",
  },
];

export default function TermsOfService() {
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
          <FileCheck2 className="mb-5 text-primary" size={32} aria-hidden="true" />
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">RaahX</p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">Terms of Service</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-gray-300">
            These general terms describe the basic expectations for using the RaahX website and submitting a project inquiry.
          </p>
          <p className="mt-6 text-sm text-gray-400">Last updated: August 9, 2026</p>
        </header>

        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-100 bg-surface p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold text-secondary">Introduction</h2>
            <p className="mt-3 leading-relaxed text-body">
              By using the RaahX website, you agree to use it responsibly and to treat the information presented as general information unless a separate written agreement says otherwise.
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-heading text-2xl font-bold text-secondary">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-body">{section.body}</p>
            </section>
          ))}

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold text-secondary">Contact</h2>
            <p className="mt-3 leading-relaxed text-body">
              Questions about these Terms of Service can be sent to{" "}
              <a href="mailto:hello@raahx.com" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark">
                hello@raahx.com
              </a>.
            </p>
          </section>

          <p className="pt-4 text-sm leading-relaxed text-gray-500">
            These terms are general website information and are not legal advice. RaahX should have them reviewed by an appropriate legal professional before production use or reliance for a particular jurisdiction.
          </p>
        </div>
      </div>
    </main>
  );
}
