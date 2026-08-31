import React from "react";
import {
  ArrowRight, LineChart, Globe, Megaphone,
  Search, Target, Share2, Code, Palette, Cpu, Briefcase, ArrowUpRight, PenTool, Smartphone
} from "lucide-react";

// Desktop (lg+) positions — nodes float directly on the growth curve, exactly
// as before. Below lg, these are NOT rendered on the canvas at all (the four
// stat cards already occupy too much of that small space); instead every
// service scrolls past in a dedicated marquee strip beneath the graph — see
// the ServiceMarquee component.
const services = [
  { icon: <Search />, label: "SEO", top: "62%", left: "16.5%", delay: "0.1s" },
  { icon: <Target />, label: "Meta Ads", top: "48%", left: "28%", delay: "0.2s" },
  { icon: <Share2 />, label: "Social Media", top: "35%", left: "39.5%", delay: "0.3s" },
  { icon: <Code />, label: "Web Dev", top: "21%", left: "51%", delay: "0.4s" },
  { icon: <Smartphone />, label: "App Dev", top: "14%", left: "57%", delay: "0.5s" },
  { icon: <Cpu />, label: "AI Tech", top: "8%", left: "62.5%", delay: "0.6s" },
  { icon: <Palette />, label: "Branding", top: "26%", left: "86%", delay: "0.7s" },
  { icon: <Megaphone />, label: "Marketing", top: "41%", left: "89%", delay: "0.8s" },
  { icon: <PenTool />, label: "Design", top: "56%", left: "87%", delay: "0.9s" },
  { icon: <Briefcase />, label: "Strategy", top: "70%", left: "78%", delay: "1.0s" },
];

export default function Hero() {
  return (
    <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-white">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[55%] rounded-full bg-gradient-to-bl from-teal-50/80 via-emerald-50/40 to-transparent blur-[120px]" />
      </div>
      
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col xl:flex-row items-center gap-12 lg:gap-8">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 text-center xl:text-left z-25 xl:pr-2 w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-100 shadow-sm text-teal-700 text-xs sm:text-sm font-bold mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
            </span>
            YOUR PATH. POWERED BY INNOVATION.
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.3rem] font-extrabold text-[#111111] leading-[1.1] mb-5 tracking-tight">
            Build Smarter. <br />
            Grow Faster. <br />
            <span className="text-teal-600 relative whitespace-nowrap inline-block mt-1">
              Scale With Us.
              <svg className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 text-teal-400/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          
          <div className="mx-auto mb-8 max-w-xl space-y-4 text-sm font-medium leading-relaxed text-gray-500 sm:text-base xl:mx-0">
            <p>RAAHX is a results-driven digital marketing agency helping businesses build stronger brands, reach the right audience, generate qualified leads, and drive sustainable growth through data, technology, creativity, and AI-powered strategies.</p>
            <p>From SEO and paid advertising to social media marketing, web development, branding, and automation, we create digital strategies built around your business goals—not generic marketing packages.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4">
            <a href="#proposal" className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-all duration-300 shadow-[0_10px_25px_-8px_rgba(15,118,110,0.5)] hover:-translate-y-0.5">
              Get Free Proposal <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a href="#services" className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-sm sm:text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-300">
              View Our Services
            </a>
          </div>
        </div>

        {/* Right Side: Graph Canvas */}
        <div className="flex-1 w-full relative z-20 mt-6 xl:mt-0 xl:min-w-[680px] max-w-[750px] mx-auto transform scale-[0.92] sm:scale-95 origin-center">
          
          <div className="relative w-full mx-auto" style={{ aspectRatio: '1000/680' }}>
            
            <svg viewBox="0 0 1000 680" className="absolute inset-0 w-full h-full overflow-visible z-10">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0F766E" />
                </linearGradient>
                <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="-8" dy="12" stdDeviation="10" floodColor="#0f766e" floodOpacity="0.18"/>
                </filter>
                <clipPath id="reveal-arrow">
                  <circle cx="80" cy="610" r="0" className="animate-reveal-circle" />
                </clipPath>
              </defs>

              <g filter="url(#barShadow)">
                <rect x="230" y="520" width="40" height="70" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0s' }} />
                <rect x="230" y="520" width="5" height="70" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0s' }} />

                <rect x="315" y="450" width="40" height="140" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0.15s' }} />
                <rect x="315" y="450" width="5" height="140" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0.15s' }} />

                <rect x="400" y="370" width="40" height="220" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0.3s' }} />
                <rect x="400" y="370" width="5" height="220" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0.3s' }} />

                <rect x="485" y="280" width="40" height="310" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0.45s' }} />
                <rect x="485" y="280" width="5" height="310" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0.45s' }} />

                <rect x="570" y="200" width="40" height="390" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0.6s' }} />
                <rect x="570" y="200" width="5" height="390" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0.6s' }} />

                <rect x="655" y="130" width="40" height="460" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0.75s' }} />
                <rect x="655" y="130" width="5" height="460" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0.75s' }} />

                <rect x="740" y="70" width="40" height="520" rx="6" fill="url(#barGrad)" className="animate-bar" style={{ animationDelay: '0.9s' }} />
                <rect x="740" y="70" width="5" height="520" rx="2.5" fill="#ffffff" opacity="0.3" className="animate-bar" style={{ animationDelay: '0.9s' }} />
              </g>

              <g stroke="#99F6E4" strokeWidth="2" strokeDasharray="5 5">
                <line x1="165" y1="470" x2="165" y2="580" />
                <line x1="280" y1="370" x2="280" y2="510" />
                <line x1="395" y1="290" x2="395" y2="430" />
                <line x1="510" y1="190" x2="510" y2="340" />
                <line x1="625" y1="100" x2="625" y2="240" />
              </g>

              <path d="M 810 90 Q 940 320, 830 620" fill="none" stroke="#99F6E4" strokeWidth="2" strokeDasharray="5 5" />

              <g clipPath="url(#reveal-arrow)">
                <path d="M 80 610 C 330 570, 550 300, 790 75" fill="none" stroke="#2DD4BF" strokeWidth="14" strokeLinecap="round" className="blur-[8px] opacity-40" />
                <path d="M 80 610 C 330 570, 550 300, 790 75" fill="none" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" />
                <g transform="translate(785, 78) rotate(-38)">
                  <polygon points="-28,24 28,0 -28,-24 -12,0" fill="#0F766E" />
                </g>
              </g>

              <g fill="#FFFFFF" stroke="#0F766E" strokeWidth="3.5">
                <circle cx="165" cy="580" r="6" />
                <circle cx="280" cy="510" r="6" />
                <circle cx="395" cy="430" r="6" />
                <circle cx="510" cy="340" r="6" />
                <circle cx="625" cy="240" r="6" />
                
                <circle cx="880" cy="250" r="5" />
                <circle cx="895" cy="410" r="5" />
                <circle cx="875" cy="565" r="5" />
              </g>
            </svg>

            {/* Floating Cards & UI — sized responsively so they don't crowd small screens */}
            <div className="absolute top-[2%] left-[0%] bg-white rounded-xl sm:rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-2 sm:p-4 flex items-center gap-2 sm:gap-4 z-40 animate-float-slow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <Globe className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-base sm:text-[1.8rem] font-black text-gray-900 leading-none mb-0.5 sm:mb-1">95%</div>
                <div className="text-[7px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Client Retention</div>
              </div>
            </div>

            <div className="absolute top-[24%] left-[2%] bg-white rounded-lg sm:rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-2 sm:p-4 flex items-center gap-2 sm:gap-3.5 z-40 animate-float-delayed">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <LineChart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-[10px] sm:text-base font-extrabold text-gray-900 leading-none mb-0.5 sm:mb-1 tracking-tight whitespace-nowrap">100+</div>
                <div className="text-[7px] sm:text-[11px] font-bold text-teal-600 whitespace-nowrap">Businesses Supported</div>
              </div>
            </div>

            <div className="absolute top-[1%] right-[0%] bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 shadow-[0_12px_25px_-4px_rgba(20,184,166,0.15)] rounded-full px-2.5 sm:px-5 py-1.5 sm:py-2.5 flex items-center gap-1 sm:gap-2 z-40">
               <span className="text-teal-800 text-[9px] sm:text-xs font-black tracking-wider whitespace-nowrap">AI-Powered Growth Strategies</span>
               <ArrowUpRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-teal-800 stroke-[3]" />
            </div>

            <div className="absolute bottom-[2%] right-[2%] w-[150px] sm:w-[240px] bg-white rounded-lg sm:rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] border border-gray-100 p-2.5 sm:p-4 z-40 animate-float-slow">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="text-teal-700 bg-teal-50 p-1 sm:p-1.5 rounded-md sm:rounded-lg border border-teal-100">
                    <Megaphone className="w-3 h-3 sm:w-4 sm:h-4"/>
                  </div>
                  <span className="font-extrabold text-gray-900 text-[10px] sm:text-xs">Data-Driven</span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[7px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase tracking-wider border border-emerald-100">Digital Marketing</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-teal-700 h-full rounded-full w-[85%] relative" />
              </div>
            </div>

            {/* Service nodes on the curve — desktop / large screens only.
                Below lg there isn't safe room next to the stat cards, so
                these are handled by the marquee strip beneath the graph instead. */}
            <div className="hidden lg:contents">
              {services.map((s) => (
                <Node key={s.label} icon={s.icon} label={s.label} top={s.top} left={s.left} delay={s.delay} />
              ))}
            </div>

          </div>

          {/* Below lg: every service scrolls past in its own strip, well clear
              of the stat cards — icons and names always fully legible, never merged. */}
          <ServiceMarquee />
        </div>

      </div>
    </section>
  );
}

function ServiceMarquee() {
  const track = [...services, ...services];
  return (
    <div className="lg:hidden mt-8 -mx-4 sm:-mx-6">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex items-center gap-3 w-max animate-marquee px-4">
          {track.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="flex items-center gap-2 bg-white rounded-full border border-gray-100 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.18)] pl-2 pr-4 py-2 shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <div className="w-4 h-4">{s.icon}</div>
              </div>
              <span className="text-xs font-extrabold text-gray-700 tracking-wide uppercase whitespace-nowrap">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Node({ icon, label, top, left, delay }: { icon: React.ReactNode, label: string, top: string, left: string, delay: string }) {
  return (
    <div
      className="absolute z-30 pointer-events-none animate-node-slide-up block select-none"
      style={{ top, left, transform: 'translate(-50%, -50%)', animationDelay: delay }}
    >
      <div className="flex flex-col items-center">
        <div className="w-11 h-11 bg-white rounded-full shadow-[0_12px_25px_-4px_rgba(15,118,110,0.14)] border border-gray-100 flex items-center justify-center text-teal-700 mb-1.5">
          <div className="w-5 h-5">{icon}</div>
        </div>
        <span className="text-[10px] font-extrabold text-gray-600 tracking-wider bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-100 uppercase whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}