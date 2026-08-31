import { Fragment } from "react";
import { Search, TrendingUp, PenSquare, Rocket, BrainCircuit } from "lucide-react";

const BADGE_DARK = "#0E3B30";
const ACCENT_TEAL = "#128C7E";
const ICON_BG = "#EEF4F3";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    subtitle: "We Listen First",
    description: "We learn about your business, audience, competitors, challenges, goals, and growth opportunities before recommending a solution.",
  },
  {
    number: "02",
    icon: TrendingUp,
    title: "Research & Strategy",
    subtitle: "Plan With Purpose",
    description: "We analyze your market, competitors, audience, search opportunities, and business objectives to create a customized digital marketing strategy.",
  },
  {
    number: "03",
    icon: PenSquare,
    title: "Design & Develop",
    subtitle: "Turn Strategy Into Action",
    description: "Our specialists transform the strategy into high-quality campaigns, content, websites, creative assets, and digital experiences built for performance.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Launch & Optimize",
    subtitle: "Performance Matters",
    description: "We launch, measure, test, and optimize your campaigns using real performance data to improve visibility, traffic, leads, conversions, and ROI.",
  },
  {
    number: "05",
    icon: BrainCircuit,
    title: "Scale With AI",
    subtitle: "Build for the Future",
    description: "We use AI, automation, data, and proven marketing frameworks to improve efficiency and create scalable systems for long-term growth.",
  },
];

function DottedArrow() {
  return (
    <svg
      className="shrink-0"
      width="44"
      height="12"
      viewBox="0 0 44 12"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="6"
        x2="34"
        y2="6"
        stroke={ACCENT_TEAL}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 6"
      />
      <path
        d="M32 1L40 6L32 11"
        stroke={ACCENT_TEAL}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function StepCard({ step }: { step: (typeof steps)[number] }) {
  const Icon = step.icon;
  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-6 pt-10 flex flex-col items-center text-center h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full text-white font-heading font-bold text-sm flex items-center justify-center shadow-md"
        style={{ backgroundColor: BADGE_DARK }}
      >
        {step.number}
      </div>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: ICON_BG }}
      >
        <Icon style={{ color: ACCENT_TEAL }} size={30} strokeWidth={1.8} />
      </div>
      <h3 className="font-heading font-bold text-secondary text-lg mb-1">{step.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{step.subtitle}</p>
      <div className="w-8 h-0.5 mb-3" style={{ backgroundColor: `${ACCENT_TEAL}66` }} />
      <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
    </div>
  );
}

export default function Process() {
  return (
    <section id="process" className="py-24 relative overflow-hidden" style={{ backgroundColor: "#F8FAF9" }}>
      {/* Decorative dot grid, top-left */}
      <div
        className="absolute top-10 left-10 w-40 h-32 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #C9D4D1 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden="true"
      />

      {/* Decorative concentric rings, top-right */}
      <svg
        className="absolute -top-10 -right-10 w-72 h-72 opacity-30 pointer-events-none"
        viewBox="0 0 300 300"
        fill="none"
        aria-hidden="true"
      >
        {[60, 90, 120, 150].map((r) => (
          <circle key={r} cx="150" cy="150" r={r} stroke="#C9D4D1" strokeWidth="1" />
        ))}
      </svg>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-base md:text-lg font-bold tracking-wide uppercase mb-4" style={{ color: ACCENT_TEAL }}>
            Our Process
          </span>
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-secondary mb-4 leading-tight">
            Our Proven Process <br className="hidden md:block" />
            From Strategy to <span style={{ color: ACCENT_TEAL }}>Growth</span>
          </h2>
          <p className="text-gray-600">
            We combine research, strategy, creative execution, technology, and continuous optimization to build digital solutions that deliver measurable business value.
          </p>
        </div>

        {/* Mobile / tablet: simple stacked grid, no connectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:hidden">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>

        {/* Desktop: cards with dashed-arrow connectors */}
        <div className="hidden lg:flex items-stretch gap-1">
          {steps.map((step, idx) => (
            <Fragment key={step.number}>
              <div className="flex-1 min-w-0">
                <StepCard step={step} />
              </div>
              {idx < steps.length - 1 && (
                <div className="flex items-center shrink-0" style={{ marginTop: "36px" }}>
                  <DottedArrow />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
