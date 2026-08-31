import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const homepageFaqItems = [
  { question: "What does a digital marketing agency do?", answer: "A digital marketing agency helps businesses attract, engage, and convert customers through online channels such as SEO, paid advertising, social media, content marketing, websites, and other digital strategies." },
  { question: "What digital marketing services does RAAHX provide?", answer: "RAAHX provides digital marketing services including SEO, social media marketing, paid advertising, website development, branding, content-focused strategies, AI automation, graphic design, business growth consulting, and app development." },
  { question: "How can digital marketing help my business grow?", answer: "A strategic digital marketing program can improve your online visibility, attract qualified traffic, generate leads, increase conversions, acquire customers, and create new opportunities for revenue growth." },
  { question: "Do you work with small businesses?", answer: "Yes. RAAHX develops scalable digital marketing strategies for small businesses based on their goals, market, competition, and available budget." },
  { question: "Do you provide B2B digital marketing?", answer: "Yes. Our B2B digital marketing strategies can include SEO, content, lead generation, paid advertising, LinkedIn campaigns, conversion optimization, and website strategy." },
  { question: "Do you work with eCommerce businesses?", answer: "Yes. We help eCommerce brands improve organic visibility, paid acquisition, conversion rates, customer acquisition, and online revenue through integrated digital marketing strategies." },
  { question: "How much do digital marketing services cost?", answer: "Digital marketing costs depend on the business goals, industry, competition, target audience, required services, and campaign scope. We provide customized proposals rather than forcing every business into the same package." },
];

const faqItems = [
  {
    question: "What services does RaahX provide?",
    answer:
      "RaahX provides integrated digital growth services including digital marketing, social media marketing, SEO, website development, branding, Meta advertising, AI automation, graphic design, business strategy, and app development. You can explore the full service range in the Services section.",
  },
  {
    question: "How does RaahX create a marketing strategy for a business?",
    answer:
      "We start with your business goals, target audience, industry, competitors, current online presence, and growth objectives. From there, we build a focused strategy that connects the right channels, creative direction, and measurable priorities for your business.",
  },
  {
    question: "Do you work with startups and small businesses?",
    answer:
      "Yes. RaahX works with businesses at different stages and shapes the approach around the client's current resources, market, and goals. We can help identify practical next steps whether you are launching, building momentum, or preparing to scale.",
  },
  {
    question: "How long does it take to see marketing results?",
    answer:
      "Timelines vary by service, industry, competition, starting position, implementation speed, and goals. Some improvements can be visible early, while services such as SEO and brand growth usually compound over time. We set expectations around the work involved rather than promising a fixed result or deadline.",
  },
  {
    question: "Do you provide SEO services?",
    answer:
      "Yes. RaahX provides technical SEO audits, keyword and competitor research, on-page and content optimization, and authority-building work. The aim is to improve search visibility and attract more qualified organic traffic through an ethical, data-informed approach.",
  },
  {
    question: "Can RaahX manage social media marketing?",
    answer:
      "Yes. Our social media service includes audience profiling, content strategy and creation, community management, and performance analytics. The work is designed to build a consistent brand presence, meaningful engagement, and quality lead opportunities.",
  },
  {
    question: "Can I request a customized marketing package?",
    answer:
      "Absolutely. Every business has different priorities, so you can contact RaahX to discuss your requirements. We will review your goals and recommend an appropriate combination of services and next steps.",
  },
  {
    question: "How can I contact RaahX?",
    answer: (
      <>
        You can email us at{" "}
        <a href="mailto:hello@raahx.com" className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary-dark">
          hello@raahx.com
        </a>{" "}
        or use the existing{" "}
        <Link to="/proposal" className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary-dark">
          proposal form
        </Link>{" "}
        to tell us about your business.
      </>
    ),
  },
];

export default function FAQ({ homepage = false }: { homepage?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = homepage ? homepageFaqItems : faqItems;

  return (
    <section id="faq" className="bg-surface py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
            {homepage ? "Frequently Asked Questions" : "FAQ"}
          </span>
          <h2 className="mb-4 text-3xl font-heading font-bold text-secondary md:text-4xl">
            {homepage ? "Digital Marketing Questions, Answered" : "Questions, answered clearly."}
          </h2>
          {!homepage && <p className="text-body">A straightforward look at how RaahX approaches digital growth and how to get started.</p>}
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <div key={item.question} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-heading text-base font-semibold text-secondary outline-none transition-colors hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/10 md:px-7"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  id={answerId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-base leading-relaxed text-body md:px-7">
                      {typeof item.answer === "string" ? item.answer : item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Mail size={16} className="text-primary" aria-hidden="true" />
          <span>Still have a question?</span>
          <a href="mailto:hello@raahx.com" className="font-semibold text-primary hover:text-primary-dark">
            hello@raahx.com
          </a>
        </div>
      </div>
    </section>
  );
}
