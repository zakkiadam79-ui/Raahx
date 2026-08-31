import {
  Bot,
  Target,
  PenTool,
  TrendingUp,
  Handshake,
  MessageCircle,
  Zap,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import qasimImage from "../assets/images/Qasim.webp";
import dawoodImage from "../assets/images/dawood.webp";
import shabanImage from "../assets/images/MrShaban.webp";
import sarahImage from "../assets/images/Sarah-Khan.webp";
import mahazImage from "../assets/images/mahaz.webp";
import ashirImage from "../assets/images/ashir.webp";

const ACCENT = "#14B8A6";

const reasons = [
  {
    icon: Bot,
    title: "AI-Powered Solutions",
    description: "We integrate practical AI and automation into marketing and business workflows to improve efficiency, insights, and scalability.",
  },
  {
    icon: Target,
    title: "Research-Driven Strategy",
    description: "Every recommendation starts with understanding your market, competitors, audience, search demand, and business objectives.",
  },
  {
    icon: PenTool,
    title: "Premium Design",
    description: "We create modern, user-focused digital experiences that communicate credibility, strengthen your brand, and support conversions.",
  },
  {
    icon: TrendingUp,
    title: "Business Growth Focus",
    description: "We focus on outcomes that matter—visibility, qualified traffic, leads, conversions, customer acquisition, revenue, and ROI.",
  },
  {
    icon: Handshake,
    title: "Complete Digital Partner",
    description: "SEO, paid advertising, social media, websites, branding, AI automation, and strategy—managed through one connected digital partner.",
  },
  {
    icon: MessageCircle,
    title: "Transparent Communication",
    description: "Clear strategies, realistic timelines, regular updates, and straightforward communication keep you informed throughout every project.",
  },
  {
    icon: Zap,
    title: "Fast, Efficient Delivery",
    description: "Our streamlined workflows help us execute efficiently while maintaining quality, strategic thinking, and attention to detail.",
  },
  {
    icon: Headphones,
    title: "Long-Term Partnership",
    description: "We don't disappear after launch. We continue to analyze, optimize, support, and identify new opportunities for sustainable growth.",
  },
];

const teamAvatars = [qasimImage, dawoodImage, shabanImage, sarahImage, mahazImage, ashirImage];

function GrowthChart() {
  const bars = [25, 45, 65, 88, 112, 138];

  return (
    <>
      <style>{`
        /* Bars pulse up and down every 5 seconds */
        @keyframes whyChooseBarPulse {
          0%, 100% { transform: scaleY(0.2); opacity: 0.2; }
          40%, 80% { transform: scaleY(1); opacity: 0.6; }
        }

        .why-bar-animated {
          transform-origin: bottom;
          animation: whyChooseBarPulse 5s ease-in-out infinite;
        }
      `}</style>
      <svg viewBox="0 0 320 200" className="w-full h-auto overflow-visible" aria-hidden="true">
        {/* Background Bars (Animated every 5s) */}
        <g>
          {bars.map((h, i) => (
            <rect
              key={i}
              className="why-bar-animated"
              x={50 + i * 46 - 10}
              y={200 - h}
              width="20"
              height={h}
              rx="4"
              fill="#2DD4BF"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </g>

        {/* Straight Clean Arrow Line + Connected Tip (Static, zero animation) */}
        <g style={{ filter: "drop-shadow(0px 0px 6px rgba(45,212,191,0.6))" }}>
          {/* Main Straight Line */}
          <path
            d="M 55 160 L 295 20"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Seamless Arrowhead Tip */}
          <path
            d="M 270 20 L 295 20 L 295 45"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </>
  );
}

export default function WhyChooseUs() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#0D2B24" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold tracking-wide uppercase mb-3" style={{ color: "#2DD4BF" }}>
            Why Businesses Choose RaahX
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            A Digital Marketing Agency Focused on <span style={{ color: "#2DD4BF" }}>Real Business Growth</span>
          </h2>
          <p className="text-gray-400">
            We combine strategy, creativity, technology, data, and AI to help businesses move beyond disconnected marketing activities and build a scalable digital growth system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2"
                style={{ backgroundColor: "#123832", borderColor: "rgba(255,255,255,0.08)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 24px 48px -12px ${ACCENT}40, 0 0 0 1px ${ACCENT}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Icon className="text-white" size={24} strokeWidth={1.8} />
                </div>
                <h3 className="font-heading font-bold text-white text-base mb-2">{reason.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA banner */}
        <div className="bg-black rounded-3xl p-6 sm:p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center overflow-hidden">
          <div>
            <span
              className="inline-block text-xs font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full mb-6"
              style={{ color: "#2DD4BF", backgroundColor: "rgba(45,212,191,0.1)" }}
            >
              Ready to Grow?
            </span>
            <h3 className="text-2xl md:text-4xl font-heading font-bold text-white mb-4 leading-tight">
              Turn Your Digital Presence <br className="hidden md:block" />
              Into a <span style={{ color: "#2DD4BF" }}>Growth Engine.</span>
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
              Whether you need better search visibility, more qualified leads, stronger campaigns, or a complete digital transformation, RAAHX can build a strategy around your goals.
            </p>

            <p className="mb-6 text-sm font-medium text-teal-200">No generic packages. No unnecessary services. Just a strategy built around your business.</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <a
                href="#proposal"
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3.5 text-sm font-semibold text-white rounded-full transition-colors shadow-lg shrink-0"
                style={{ backgroundColor: "#14B8A6" }}
              >
                Get Free Proposal <ArrowUpRight size={16} />
              </a>

              {/* Fixed Responsive Avatars & Text Section */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex -space-x-2.5">
                  {teamAvatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="RaahX team member"
                      width={256}
                      height={256}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 sm:border-[3px] border-black object-cover shadow-lg"
                      style={{ zIndex: teamAvatars.length - i }}
                    />
                  ))}
                </div>
                <div className="text-sm shrink-0">
                  <div className="text-white font-semibold leading-tight whitespace-nowrap">100+ Businesses</div>
                  <div className="text-gray-400 text-xs leading-tight whitespace-nowrap">Trust RaahX</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <GrowthChart />
          </div>
        </div>
      </div>
    </section>
  );
}