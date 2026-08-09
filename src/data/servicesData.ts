import { Megaphone, Search, PenTool, MonitorSmartphone, Share2, Palette, Target, Cpu, Briefcase, Code2, LucideIcon } from "lucide-react";

export interface ServiceData {
  slug: string;
  name: string;
  icon: LucideIcon;
  heroTitle: string;
  heroSubtitle: string;
  overview: string;
  whyChooseTitle: string;
  whyChooseText: string;
  process: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  stats: { label: string; value: string }[];
  testimonial: { quote: string; author: string };
}

export const servicesData: ServiceData[] = [
  {
    slug: "digital-marketing",
    name: "Digital Marketing Services",
    icon: Megaphone,
    heroTitle: "Accelerate Business Growth with AI-Powered Digital Marketing",
    heroSubtitle: "Turn data into revenue with integrated, high-performance marketing strategies built for today's competitive landscape.",
    overview: "Grow your business with digital marketing strategies that actually move the needle. RaahX combines AI, data analytics, creative agility, and performance marketing to help you attract qualified customers, increase conversions, and maximize revenue. From high-level strategy development to granular campaign execution, every solution we deploy is customized to achieve measurable business growth.",
    whyChooseTitle: "Why Choose Our Digital Marketing Services",
    whyChooseText: "Digital marketing should do more than generate traffic—it should generate tangible results. At RaahX, we build integrated marketing strategies where every channel (SEO, paid ads, content, and social) works in synergy toward a single goal: scaling your business. Our team continuously analyzes data, optimizes campaigns, and adapts to market trends to ensure every marketing dollar you invest delivers measurable, bottom-line value.",
    process: [
      { title: "Discovery & Audit", description: "We analyze your market, competitors, and current digital footprint." },
      { title: "Strategic Roadmap", description: "We build an AI-backed, multi-channel strategy tailored to your revenue goals." },
      { title: "Integrated Execution", description: "We launch targeted campaigns across the most effective digital platforms." },
      { title: "Data-Driven Optimization", description: "We continuously refine and scale based on real-time performance metrics." },
    ],
    benefits: [
      { title: "Higher ROI", description: "Maximized return on ad spend through continuous optimization." },
      { title: "Qualified Traffic", description: "Attract audiences with a high intent to purchase." },
      { title: "Unified Strategy", description: "Eliminate siloed marketing for a cohesive brand presence." },
    ],
    stats: [
      { label: "Projects Delivered", value: "150+" },
      { label: "Client Rating", value: "4.9★" },
      { label: "Avg. ROI Increase", value: "3x" },
    ],
    testimonial: { quote: "RaahX became more than an agency—they became a strategic growth partner that genuinely cares about our business success. Our digital footprint has never been stronger.", author: "Hamza Khan" },
  },
  {
    slug: "social-media-marketing",
    name: "Social Media Marketing",
    icon: Share2,
    heroTitle: "Build a Stronger Brand Through Strategic Social Media",
    heroSubtitle: "Turn scrolling audiences into loyal customers with content that captivates and converts.",
    overview: "Your customers spend hours on social media every day. RaahX helps your business capture their attention with engaging content, consistent branding, and strategic campaigns designed to increase awareness, build trust, and generate quality leads across every major platform.",
    whyChooseTitle: "Why Choose Our Social Media Marketing Service",
    whyChooseText: "In today's saturated digital landscape, social media is more than just a platform for posting content—it's where brands build credibility and drive business growth. Successful social media isn't about posting more; it's about creating meaningful connections. We develop content strategies that strengthen your brand identity and convert passive followers into active buyers through consistent storytelling and performance-driven execution.",
    process: [
      { title: "Audience Profiling", description: "We identify exactly who your customers are and where they spend their time." },
      { title: "Content Strategy & Creation", description: "We design premium visual and written content that aligns with your brand voice." },
      { title: "Community Management", description: "We actively engage with your audience to foster trust and loyalty." },
      { title: "Performance Analytics", description: "We track engagement and conversion metrics to refine our approach." },
    ],
    benefits: [
      { title: "Enhanced Brand Loyalty", description: "Build deep, lasting relationships with your target market." },
      { title: "Increased Engagement", description: "Spark conversations that keep your brand top-of-mind." },
      { title: "Quality Lead Generation", description: "Drive motivated traffic directly from social channels to your sales funnel." },
    ],
    stats: [
      { label: "Campaigns Managed", value: "200+" },
      { label: "Avg. Engagement Lift", value: "45%" },
      { label: "Client Rating", value: "4.8★" },
    ],
    testimonial: { quote: "RaahX completely transformed our social media presence. Our engagement, inquiries, and customer trust increased beyond our expectations.", author: "Ayesha Khan" },
  },
  {
    slug: "seo-services",
    name: "SEO Services",
    icon: Search,
    heroTitle: "Increase Organic Traffic and Long-Term Business Growth",
    heroSubtitle: "Dominate search engine rankings and get found by customers actively looking for what you sell.",
    overview: "Help potential customers find your business at the exact moment they need you. RaahX delivers comprehensive SEO strategies that improve search visibility, increase qualified traffic, and build sustainable online authority through technical optimization, intelligent keyword strategy, and high-quality content generation.",
    whyChooseTitle: "Why Choose Our SEO Services",
    whyChooseText: "Search engines are where your customers begin their buying journey. SEO is a long-term investment in your business's future. Our team focuses on ethical, data-driven optimization techniques that improve search rankings while creating a frictionless user experience. The result is consistent, compounding organic growth that continues generating leads long after campaigns begin.",
    process: [
      { title: "Technical SEO Audit", description: "We identify and fix backend issues holding your site back." },
      { title: "Keyword & Competitor Research", description: "We map out high-value search terms your audience uses." },
      { title: "On-Page & Content Optimization", description: "We align your website's content with search intent." },
      { title: "Authority Building", description: "We acquire high-quality backlinks to boost your domain authority." },
    ],
    benefits: [
      { title: "Sustainable Traffic", description: "Generate consistent leads without relying solely on paid ads." },
      { title: "Higher Conversion Rates", description: "Capture users with high purchase intent." },
      { title: "Industry Authority", description: "Position your brand as the definitive leader in your market." },
    ],
    stats: [
      { label: "Keywords Ranked", value: "500+" },
      { label: "Avg. Traffic Growth", value: "124%" },
      { label: "Client Rating", value: "4.9★" },
    ],
    testimonial: { quote: "Our website rankings improved significantly, and we now receive consistent organic leads every month. The ROI has been incredible.", author: "Muhammad Ali" },
  },
  {
    slug: "website-development",
    name: "Website Development",
    icon: MonitorSmartphone,
    heroTitle: "Build High-Performance Websites Designed to Convert",
    heroSubtitle: "Your digital storefront, engineered for speed, user experience, and revenue generation.",
    overview: "A professional website is your business's most valuable digital asset. RaahX designs fast, responsive, and conversion-focused websites that combine modern aesthetics, intuitive user experience, and flawless technical performance to turn casual visitors into paying customers.",
    whyChooseTitle: "Why Choose Our Website Development Service",
    whyChooseText: "Your website is often the first impression customers have of your business, and a beautiful website means little if it doesn't produce results. Every platform we build is meticulously optimized for speed, mobile responsiveness, SEO, security, and lead generation. Our goal is to create digital experiences that not only look premium but actively function as your best 24/7 salesperson.",
    process: [
      { title: "UX/UI Strategy", description: "We map out user journeys that drive visitors toward conversion points." },
      { title: "Custom Design", description: "We craft premium visual layouts that reflect your brand identity." },
      { title: "Development & Integration", description: "We write clean, secure code and integrate necessary business tools." },
      { title: "Testing & Launch", description: "We rigorously test for speed, bugs, and mobile compatibility before going live." },
    ],
    benefits: [
      { title: "Mobile-First Optimization", description: "Flawless functionality across all devices and screen sizes." },
      { title: "Lightning-Fast Load Times", description: "Keep visitors engaged and reduce bounce rates." },
      { title: "Conversion-Centric Architecture", description: "Strategic layouts designed to generate leads and sales." },
    ],
    stats: [
      { label: "Sites Launched", value: "80+" },
      { label: "Avg. Load Time", value: "<2s" },
      { label: "Client Rating", value: "5.0★" },
    ],
    testimonial: { quote: "The website RaahX built perfectly represents our brand and has significantly increased customer inquiries. It's exactly what we needed to scale.", author: "Fatima Noor" },
  },
  {
    slug: "branding",
    name: "Branding Services",
    icon: Palette,
    heroTitle: "Create a Brand That Customers Trust and Remember",
    heroSubtitle: "Forge a powerful market identity that separates you from the competition and builds lasting loyalty.",
    overview: "Strong brands create lasting impressions and command premium pricing. RaahX develops complete brand identities—including logos, visual systems, messaging frameworks, brand guidelines, and creative assets—that help businesses establish instant credibility and stand out in fiercely competitive markets.",
    whyChooseTitle: "Why Choose Our Branding Services",
    whyChooseText: "A memorable brand creates trust, recognition, and long-term customer loyalty. Your brand is much more than just a logo—it's your reputation. We build strategic, cohesive brand identities that communicate professionalism and ensure a consistent, premium experience across every single customer touchpoint.",
    process: [
      { title: "Brand Discovery", description: "We uncover your core values, mission, and unique market positioning." },
      { title: "Visual Identity Creation", description: "We design logos, color palettes, and typography systems." },
      { title: "Messaging & Voice", description: "We develop a compelling brand narrative and communication style." },
      { title: "Asset Rollout", description: "We deliver comprehensive guidelines and marketing materials to ensure consistency." },
    ],
    benefits: [
      { title: "Market Differentiation", description: "Stand out instantly in crowded industries." },
      { title: "Customer Trust", description: "Project a premium, established image that buyers feel confident in." },
      { title: "Brand Consistency", description: "Unify your marketing efforts under one powerful identity." },
    ],
    stats: [
      { label: "Brands Built", value: "60+" },
      { label: "Client Retention", value: "95%" },
      { label: "Client Rating", value: "4.9★" },
    ],
    testimonial: { quote: "RaahX gave our business a completely new identity that truly reflects our vision and professionalism. We finally look like the industry leaders we are.", author: "Usman Tariq" },
  },
  {
    slug: "meta-advertising",
    name: "Meta Advertising Services",
    icon: Target,
    heroTitle: "Generate Qualified Leads with High-Performance Meta Ads",
    heroSubtitle: "Turn Facebook and Instagram into your most reliable, scalable engines for customer acquisition.",
    overview: "Reach the exact right audience through professionally managed Facebook and Instagram advertising campaigns. RaahX combines deep audience research, scroll-stopping creative strategy, AI optimization, and continuous A/B testing to maximize your return on ad spend (ROAS) and drive predictable growth.",
    whyChooseTitle: "Why Choose Our Meta Advertising Services",
    whyChooseText: "Successful advertising isn't about spending more—it's about spending smarter. Boosting posts isn't a strategy; it's a gamble. We develop data-driven, highly targeted campaigns focused squarely on customer acquisition, lead generation, and measurable business growth. We continuously optimize ad performance to reduce your cost-per-acquisition (CPA) and improve lead quality.",
    process: [
      { title: "Audience Targeting", description: "We utilize advanced data sets to pinpoint your ideal buyers." },
      { title: "Creative Development", description: "We design high-converting ad copy and striking visuals." },
      { title: "Campaign Architecture", description: "We build structured funnels for awareness, consideration, and conversion." },
      { title: "Optimization & Scaling", description: "We aggressively test variables and scale the winning combinations." },
    ],
    benefits: [
      { title: "Predictable Revenue", description: "Build reliable funnels that consistently generate sales." },
      { title: "Lower Customer Acquisition Cost", description: "Hyper-targeted ads that waste zero budget." },
      { title: "Rapid Scalability", description: "Quickly increase volume once profitable metrics are achieved." },
    ],
    stats: [
      { label: "Ad Spend Managed", value: "PKR 30M+" },
      { label: "Avg. ROAS", value: "4.2x" },
      { label: "Client Rating", value: "4.8★" },
    ],
    testimonial: { quote: "Every campaign delivered by RaahX produced measurable results with a much better return than our previous advertising efforts. They know exactly how to scale.", author: "Sara Ahmed" },
  },
  {
    slug: "ai-automation",
    name: "AI Automation Services",
    icon: Cpu,
    heroTitle: "Automate Business Processes with Intelligent AI Solutions",
    heroSubtitle: "Work smarter, scale faster, and eliminate operational bottlenecks with intelligent technology.",
    overview: "Increase efficiency and drastically reduce operational costs with AI-powered automation. RaahX develops intelligent workflows, custom AI assistants, conversational chatbots, and seamless business automation systems that handle repetitive tasks so your team can focus on what matters most.",
    whyChooseTitle: "Why Choose Our AI Automation Services",
    whyChooseText: "Modern businesses need smarter systems to remain competitive. Automation allows your company to do more with less. Our AI solutions are designed to eliminate manual, repetitive processes, improve operational efficiency, and deliver frictionless, lightning-fast customer experiences. We give your team the time back to focus on strategic work that drives long-term innovation.",
    process: [
      { title: "Workflow Audit", description: "We identify manual processes and bottlenecks costing you time and money." },
      { title: "Solution Architecture", description: "We design custom AI workflows and automation mapping." },
      { title: "Integration & Deployment", description: "We seamlessly connect AI tools with your existing tech stack." },
      { title: "Training & Refinement", description: "We ensure your team adapts and the systems run flawlessly." },
    ],
    benefits: [
      { title: "Reduced Overhead", description: "Lower operational costs by automating time-consuming tasks." },
      { title: "24/7 Operations", description: "Engage customers and process data around the clock without human fatigue." },
      { title: "Error Reduction", description: "Eliminate costly manual data-entry mistakes." },
    ],
    stats: [
      { label: "Workflows Automated", value: "40+" },
      { label: "Avg. Time Saved", value: "30%" },
      { label: "Client Rating", value: "4.9★" },
    ],
    testimonial: { quote: "The automation solutions developed by RaahX have significantly improved our team's productivity and customer response times. It has completely changed how we operate.", author: "Bilal Hussain" },
  },
  {
    slug: "graphic-design",
    name: "Graphic Design Services",
    icon: PenTool,
    heroTitle: "Premium Graphic Design That Strengthens Your Brand",
    heroSubtitle: "Capture attention and communicate value instantly with world-class visual design.",
    overview: "Professional design builds instant credibility and captures attention in a noisy world. RaahX creates impactful visual content—including social media creatives, advertising campaigns, marketing materials, sales presentations, packaging, and digital assets—that communicates your brand's value with total clarity and consistency.",
    whyChooseTitle: "Why Choose Our Graphic Design Services",
    whyChooseText: "Powerful design communicates professionalism before a single word is spoken. Great design isn't just about making things look pretty; it solves business problems. Every visual asset we create is strategically engineered to strengthen your brand identity, improve message retention, and increase customer engagement while maintaining a premium appearance across every platform.",
    process: [
      { title: "Creative Briefing", description: "We align on your specific goals, aesthetic preferences, and target audience." },
      { title: "Concept Development", description: "We draft initial visual directions for your feedback." },
      { title: "Design Execution", description: "We craft high-resolution, premium assets tailored to specific channels." },
      { title: "Final Polish & Handoff", description: "We deliver files in all necessary formats, ready for immediate use." },
    ],
    benefits: [
      { title: "Elevated Brand Perception", description: "Look like a premium, top-tier organization." },
      { title: "Higher Engagement", description: "Thumb-stopping visuals that cut through the digital noise." },
      { title: "Cohesive Assets", description: "A unified visual language across print and digital media." },
    ],
    stats: [
      { label: "Assets Delivered", value: "1000+" },
      { label: "Avg. Turnaround", value: "48hrs" },
      { label: "Client Rating", value: "4.9★" },
    ],
    testimonial: { quote: "The quality and creativity of every design exceeded our expectations and helped elevate our brand image. Their team is exceptionally talented.", author: "Hina Malik" },
  },
  {
    slug: "business-strategy",
    name: "Business Strategy & Growth Consulting",
    icon: Briefcase,
    heroTitle: "Transform Ideas into Sustainable Business Growth",
    heroSubtitle: "Scale with confidence using data-driven strategies built for the modern digital economy.",
    overview: "Every successful business starts with the right strategy. RaahX partners with founders, startups, SMEs, and growing enterprises to develop highly practical growth strategies. We help you improve market positioning, strengthen customer acquisition channels, and architect scalable business models built for long-term viability.",
    whyChooseTitle: "Why Choose Our Business Strategy & Growth Consulting Service",
    whyChooseText: "Business growth requires more than good ideas—it requires precise execution and the right direction. We work closely with leadership teams to identify untapped opportunities and solve complex growth challenges. Our strategic approach combines deep market research, competitive analysis, digital expertise, and AI-powered insights to help you make smarter decisions with absolute confidence.",
    process: [
      { title: "Deep-Dive Assessment", description: "We analyze your current business model, financials, and market position." },
      { title: "Opportunity Mapping", description: "We identify the fastest paths to revenue and scalability." },
      { title: "Strategic Blueprinting", description: "We deliver a step-by-step, actionable growth roadmap." },
      { title: "Execution Advisory", description: "We provide ongoing guidance to ensure successful implementation." },
    ],
    benefits: [
      { title: "Clear Direction", description: "Eliminate guesswork and make decisions backed by hard data." },
      { title: "Competitive Advantage", description: "Outmaneuver competitors by identifying market gaps." },
      { title: "Scalable Frameworks", description: "Build systems that support rapid, sustainable expansion." },
    ],
    stats: [
      { label: "Businesses Advised", value: "35+" },
      { label: "Avg. Growth Rate", value: "60%" },
      { label: "Client Rating", value: "5.0★" },
    ],
    testimonial: { quote: "The strategic guidance from RaahX gave us clarity, direction, and a stronger competitive advantage in our industry. We are finally scaling predictably.", author: "Zain Ahmed" },
  },
  {
    slug: "app-development",
    name: "App Development",
    icon: Code2,
    heroTitle: "Custom App Development Built to Perform",
    heroSubtitle: "From concept to launch, we build fast, reliable mobile and web apps engineered around your users and your business goals.",
    overview: "A great app is more than clean code—it's a product people actually want to use. RaahX designs and builds custom mobile and web applications with a focus on performance, usability, and long-term scalability, so your app grows smoothly alongside your business.",
    whyChooseTitle: "Why Choose Our App Development Services",
    whyChooseText: "Most businesses don't need more features—they need an app that works flawlessly and feels effortless to use. We combine thoughtful UX, clean architecture, and rigorous testing to deliver apps that are fast, stable, and genuinely enjoyable to use, backed by ongoing support after launch.",
    process: [
      { title: "Discovery & Planning", description: "We map out your app's core features, user flows, and technical requirements before writing a single line of code." },
      { title: "UI/UX Design", description: "We design intuitive, on-brand interfaces that make your app simple and enjoyable to use." },
      { title: "Development & Testing", description: "We build with clean, scalable code and test rigorously across devices to catch issues before launch." },
      { title: "Launch & Ongoing Support", description: "We deploy your app and provide continued maintenance, updates, and improvements after launch." },
    ],
    benefits: [
      { title: "Cross-Platform Performance", description: "Smooth, reliable performance across iOS, Android, and web." },
      { title: "Scalable Architecture", description: "Built to handle growth without needing a costly rebuild later." },
      { title: "Ongoing Support", description: "Continued updates and maintenance well after launch day." },
    ],
    stats: [
      { label: "Apps Delivered", value: "20+" },
      { label: "Avg. Crash-Free Rate", value: "99%" },
      { label: "Client Rating", value: "4.9★" },
    ],
    testimonial: { quote: "RaahX built our app exactly the way we envisioned it—fast, stable, and easy for our customers to use from day one.", author: "Happy Client" },
  },
];
