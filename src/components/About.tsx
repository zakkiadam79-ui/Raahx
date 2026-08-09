import { Sparkles, Target, Eye, Layers } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            Expand Opportunities for Your Business
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-6">
            Accelerate Growth with AI-Powered Digital Solutions
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            In today's competitive digital landscape, growth requires more than marketing—it demands strategy, innovation, and execution. Whether you're launching a startup, strengthening your brand, or scaling an established business, RaahX delivers intelligent digital solutions designed to increase visibility, attract high-value customers, and generate measurable business growth.
          </p>
          <p className="text-gray-600 leading-relaxed">
            From AI-powered marketing and premium branding to web development, automation, and performance-driven campaigns, we help businesses transform opportunities into sustainable success.
          </p>
        </div>

        {/* About RaahX */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-2">
            About RaahX
          </h3>
          <p className="text-primary font-medium mb-6">Your Growth Partner. Powered by AI.</p>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              RaahX is a next-generation AI-powered digital growth company committed to helping ambitious businesses build, grow, and scale with confidence.
            </p>
            <p>
              We combine strategic thinking, creativity, technology, and artificial intelligence to create digital experiences that drive real business outcomes. Our integrated approach brings together branding, website development, SEO, paid advertising, AI automation, and digital marketing into one powerful growth ecosystem.
            </p>
            <p>
              Every project begins with research, is guided by data, and is executed with precision—ensuring every investment contributes to stronger brand positioning, higher customer engagement, and long-term business growth.
            </p>
            <p>
              At RaahX, we don't simply provide digital services—we become a strategic partner dedicated to helping your business reach its full potential.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="p-8 bg-teal-50/30 rounded-2xl border border-teal-100/50">
            <Target className="text-primary mb-4" size={28} />
            <h3 className="font-heading font-semibold text-secondary text-xl mb-2">Our Mission</h3>
            <p className="text-primary text-sm font-medium mb-4">Empowering Businesses Through Innovation</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our mission is to empower startups, SMEs, and enterprises with intelligent digital solutions that simplify growth through creativity, technology, and artificial intelligence.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We believe every business deserves access to world-class branding, high-performance websites, data-driven marketing, and AI-powered automation that delivers measurable results. Every strategy we create is focused on helping our clients grow faster, compete smarter, and build sustainable success in an ever-evolving digital world.
            </p>
          </div>

          <div className="p-8 bg-teal-50/30 rounded-2xl border border-teal-100/50">
            <Eye className="text-primary mb-4" size={28} />
            <h3 className="font-heading font-semibold text-secondary text-xl mb-2">Our Vision</h3>
            <p className="text-primary text-sm font-medium mb-4">Building the Future of Digital Growth</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our vision is to become Pakistan's leading AI-powered digital growth company while establishing RaahX as a globally recognized brand known for innovation, creativity, and measurable business impact.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We envision a future where businesses of every size leverage technology, AI, and strategic marketing to unlock new opportunities, outperform competitors, and achieve sustainable growth on a global scale.
            </p>
          </div>
        </div>

        {/* What Makes RaahX Different */}
        <div className="p-8 md:p-10 bg-secondary rounded-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="text-white/70" size={22} />
          </div>
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
            What Makes RaahX Different?
          </h3>
          <p className="text-primary font-medium mb-6">Strategy First. Results Always.</p>
          <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
            <p>
              Most agencies focus on delivering services. We focus on delivering growth.
            </p>
            <p>
              At RaahX, every solution is built around your business objectives—not generic marketing packages. We combine market research, strategic planning, creative excellence, AI technology, and performance analytics to develop customized growth systems that generate lasting value.
            </p>
            <p>
              By integrating branding, web development, SEO, paid advertising, AI automation, and digital strategy under one roof, we eliminate disconnected marketing efforts and create seamless digital experiences that increase visibility, improve conversions, strengthen customer relationships, and maximize return on investment.
            </p>
            <p className="text-white font-medium">
              We don't measure success by completed projects—we measure it by the growth we create for our clients.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
