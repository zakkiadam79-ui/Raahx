import type { ServiceIconName } from "../utils/getServiceIcon";

export interface ServiceData {
  slug: string;
  name: string;
  icon: ServiceIconName;
  heroTitle: string;
  heroSubtitle: string;
  cardDescription?: string;
  cardCtaLabel?: string;
  heroCtaLabel?: string;
  overviewTitle?: string;
  overview: string;
  whyChooseTitle: string;
  whyChooseText: string;
  processTitle?: string;
  process: { title: string; description: string }[];
  benefitsTitle?: string;
  benefits: { title: string; description: string }[];
  stats: { label: string; value: string }[];
  testimonial: { quote: string; author: string };
  contentSections?: {
    key: string;
    eyebrow?: string;
    heading: string;
    body?: string;
    items: { title: string; description: string; details?: string }[];
  }[];
  ctaTitle?: string;
  ctaText?: string;
  ctaSupportingText?: string;
  ctaLabel?: string;
}

const baseServicesData: ServiceData[] = [
  {
    slug: "digital-marketing",
    name: "Digital Marketing Services",
    icon: "Megaphone",
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
    icon: "Share2",
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
    icon: "Search",
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
    icon: "MonitorSmartphone",
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
    icon: "Palette",
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
    icon: "Target",
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
    icon: "Cpu",
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
    icon: "PenTool",
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
    icon: "Briefcase",
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
    icon: "Code2",
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

const documentedServiceContent: Record<string, Partial<ServiceData>> = {
  "digital-marketing": {
    cardDescription: "Build a complete digital growth strategy that connects your marketing channels, audience, technology, and business goals.",
    cardCtaLabel: "Explore Digital Marketing",
    heroTitle: "Digital Marketing Services That Actually Move the Needle",
    heroSubtitle: "Turn your online presence into something that consistently brings in leads, customers, and revenue — not just traffic and vanity metrics.\n\nAt RaahX, we combine SEO, paid advertising, social media, content, and AI-driven insights into one connected strategy, so your business reaches the right people and converts more of them into paying customers.",
    heroCtaLabel: "Get Your Free Digital Marketing Proposal",
    overviewTitle: "Turn Online Searches Into Real Business",
    overview: "Somewhere right now, someone is searching for exactly what you sell. The question is whether they find your business first or a competitor's.\n\nThat's the gap the right digital marketing strategy closes.\n\nMost agencies treat SEO, Google Ads, social media, and content as separate line items. We don't. At RaahX, we connect them around one outcome: getting your business in front of the right audience and turning that attention into action.\n\nWe start by looking honestly at where you stand today — your website, your competitors, your market — and use that to figure out where the real opportunities are. From there, we build a strategy shaped by your budget, your audience, and what you're actually trying to achieve.",
    whyChooseTitle: "Why Businesses Choose RaahX",
    whyChooseText: "Marketing Built Around Your Business, Not a Package\n\nPlenty of agencies will promise you more traffic, more followers, more rankings. None of that means much if it's not translating into revenue.\n\nSo before we pitch a channel or launch a single campaign, we take the time to actually understand your business, your customers, and your goals. The channels come after — not before.\n\nA strategy shaped by your business\nNo template marketing plans copy-pasted between clients. Your industry, your competitors, your audience, and your sales process all shape what we recommend.\n\nReporting that actually makes sense\nYou shouldn't need a marketing degree to read your own results. We report on what matters — leads, conversions, cost per acquisition, return on ad spend — not just clicks and impressions.\n\nAI as a tool, not a replacement\nWe use AI to speed up research, spot opportunities, and make sense of campaign data faster. The strategic thinking behind your campaigns still comes from our team.\n\nChannels that talk to each other\nYour Google Ads data can point to search trends worth chasing in SEO. Your SEO performance can surface content ideas. Your social audience can sharpen your paid targeting. We use what one channel tells us to improve the others.\n\nOngoing improvement, not a set-and-forget campaign\nWe keep watching performance, testing what could work better, and adjusting when the numbers point somewhere new.",
    processTitle: "How We Make It Happen",
    process: [
      { title: "Discovery & Marketing Audit", description: "We start by getting to know your business — your website, current marketing, competitors, audience, and results. Includes: business research, audience research, competitor analysis, website review, channel audit, conversion review, and growth opportunities." },
      { title: "Digital Marketing Strategy", description: "We choose channels and priorities based on your goals, budget, audience, and sales cycle. Includes: marketing strategy, channel planning, audience targeting, customer journey, campaign planning, budget planning, and KPI setting." },
      { title: "Integrated Campaign Execution", description: "We manage the channels your business needs under one connected strategy. Includes: SEO, PPC and Google Ads, social media, content marketing, paid social, landing-page optimization, and performance marketing." },
      { title: "Data-Driven Optimization", description: "We review what drives results and adjust what does not. Includes: performance tracking, conversion analysis, A/B testing, audience refinement, ad optimization, budget adjustments, and ROI analysis." },
    ],
    benefitsTitle: "What You Actually Get With RaahX",
    benefits: [
      { title: "More Qualified Traffic", description: "We focus on reaching people who actually want what you offer, not chasing numbers for their own sake." },
      { title: "More Opportunities to Convert", description: "We improve the path from the first click to the enquiry, booking, or purchase." },
      { title: "Better Decisions, Backed by Data", description: "Real campaign data and customer behaviour guide our recommendations, not guesswork." },
      { title: "A Stronger, More Consistent Presence", description: "We keep your brand visible and recognizable whether customers find you on Google or social media." },
      { title: "Growth That Compounds", description: "The goal is not one good campaign. It is finding what works and building on it as your business grows." },
    ],
    stats: [
      { label: "Projects Delivered", value: "150+" },
      { label: "Client Rating", value: "4.9★" },
      { label: "Average ROI Increase", value: "3x" },
    ],
    contentSections: [
      { key: "full-process", heading: "Our Process, Step by Step", items: [
        { title: "Discover", description: "We learn your business, your customers, your competitors, and your goals." },
        { title: "Audit", description: "We review your website, SEO, ads, content, social, and conversion performance to find the gaps." },
        { title: "Strategize", description: "We turn what we find into a clear roadmap with real priorities and measurable goals." },
        { title: "Execute", description: "We launch and manage the right campaigns, keeping every channel connected." },
        { title: "Optimize", description: "We monitor results, test new approaches, and refine based on the data." },
        { title: "Scale", description: "When something works, we expand it through more budget, audiences, and channels." },
      ] },
      { key: "service-types", heading: "Our Digital Marketing Services", items: [
        { title: "SEO Services", description: "Get found when people are actively searching through technical SEO, keyword research, content optimization, internal linking, and authority building." },
        { title: "PPC Services", description: "Reach people ready to act through Google Ads and paid search, with continual keyword, copy, targeting, and budget refinement." },
        { title: "Social Media Marketing", description: "Stay relevant through content and engagement strategies built around awareness and bringing people back to your business." },
        { title: "Content Marketing", description: "Articles, landing pages, and content that answer customer questions, support SEO, and move people closer to a decision." },
        { title: "Performance Marketing", description: "Measure every dollar against real outcomes and continually refine what is not generating returns." },
      ] },
      { key: "business-growth", heading: "Will Digital Marketing Actually Grow My Business?", body: "Honestly — that's the right question to ask. Better rankings, traffic, and followers are useful only when they lead to enquiries, customers, or revenue. At RaahX, traffic, rankings, and engagement are steps toward something bigger: more of the right people finding you, more of them taking action, and more of them choosing your business over the competition.", items: [] },
      { key: "faqs", eyebrow: "Frequently Asked Questions", heading: "Digital Marketing Questions, Answered", items: [
        { title: "How is RaahX different from other digital marketing companies in Pakistan?", description: "We identify which channels are worth investing in based on your audience, competitors, goals, and budget, then run them together instead of as disconnected campaigns." },
        { title: "How soon can I expect results?", description: "It depends on the channel. Paid advertising can produce data and leads quickly, while SEO and content marketing take longer because organic visibility and authority build over time." },
        { title: "Do you work with businesses outside Pakistan?", description: "Yes. We work locally across Pakistan and in international markets. The strategy depends on where your customers are and how they buy." },
        { title: "What does AI-powered digital marketing actually mean here?", description: "We use AI for audience research, data analysis, content research, and spotting opportunities faster, while strategic decisions remain with our team." },
        { title: "Can you manage all our digital marketing channels?", description: "Yes. SEO, PPC, social, content, and performance campaigns can run under one strategy, or we can focus on only the channels you need." },
      ] },
    ],
    ctaTitle: "Ready to Build Smarter and Grow Faster?",
    ctaText: "Partner with a digital marketing agency that combines strategy, creativity, technology, data, and AI to turn your online presence into a scalable growth engine.",
    ctaSupportingText: "Tell us where your business is today, where you want to go, and we'll help map the path forward.",
    ctaLabel: "Get Your Free Digital Marketing Proposal",
  },
  "social-media-marketing": {
    cardDescription: "Build an active social presence with strategic content, audience engagement, paid campaigns, and performance-focused social media marketing.",
    cardCtaLabel: "Explore Social Media",
    heroTitle: "Build a Stronger Brand Through Strategic Social Media",
    heroSubtitle: "Turn scrolling audiences into loyal customers with social media marketing built to increase visibility, engagement, and qualified leads — not just likes.",
    overviewTitle: "Social Media That Does More Than Fill Your Feed",
    overview: "Turn Attention Into Meaningful Action\n\nYour customers are already spending hours a day on social media. The hard part isn't finding them — it's earning their attention and giving them a reason to engage with your brand.\n\nRaahX brings together social strategy, creative content, audience engagement, paid campaigns, and performance analytics to help businesses build real online communities and turn those interactions into business opportunities.\n\nPosting consistently isn't the goal on its own. We build data-driven social strategies that connect your brand with potential customers, build credibility, spark engagement, and support your broader marketing goals.",
    whyChooseTitle: "What Our Social Media Marketing Can Do for Your Brand",
    whyChooseText: "A Strategy Built Around Your Business\n\nEvery campaign has a clear job to do — whether that is raising awareness or generating qualified leads. Strategy comes before content, creative works alongside data, engagement builds relationships, and clear analytics show what is working.",
    processTitle: "Our Social Media Marketing Process",
    process: [
      { title: "Understand Your Audience", description: "We identify who you want to reach, including their interests, behaviors, needs, and preferred platforms." },
      { title: "Build Your Strategy", description: "We shape a strategy around your business goals, customer journey, brand positioning, and growth opportunities." },
      { title: "Create Content That Connects", description: "We develop content that reflects your brand and gives your audience real reasons to engage." },
      { title: "Launch & Manage Campaigns", description: "We publish, monitor, and manage campaigns while engaging your audience and maintaining consistent communication." },
      { title: "Measure What Matters", description: "We track engagement, reach, audience growth, traffic, leads, and overall campaign performance." },
      { title: "Optimize for Better Results", description: "We use performance data to fix what is underperforming and build on what works." },
    ],
    benefitsTitle: "More Than Followers. More Meaningful Growth.",
    benefits: [
      { title: "Stronger Brand Loyalty", description: "Consistent communication and useful content build lasting audience relationships." },
      { title: "More Engagement", description: "Give people something worth responding to, sharing, saving, or discussing." },
      { title: "Better Quality Leads", description: "Turn social attention into opportunities through strategic content, clear calls to action, and targeted campaigns." },
      { title: "A Stronger Online Presence", description: "Stay visible and recognizable throughout the customer journey, not just in a single post." },
    ],
    stats: [
      { label: "Campaigns Managed", value: "200+" },
      { label: "Average Engagement Lift", value: "45%" },
      { label: "Client Rating", value: "4.8★" },
    ],
    contentSections: [
      { key: "capabilities", heading: "Content and Campaigns Built to Perform", items: [
        { title: "Content Worth Stopping For", description: "We combine strong copy, branded visuals, educational posts, promotions, short-form video, and storytelling.", details: "Build brand awareness\nEducate potential customers\nShowcase products or services\nSpark genuine engagement\nBuild trust and credibility\nDrive website traffic\nGenerate leads" },
        { title: "Campaigns Managed From Idea to Result", description: "We plan, execute, and continually adjust campaigns while monitoring targeting, creative performance, engagement, traffic, and conversions." },
        { title: "Paid Social to Reach the Right People, Faster", description: "We run paid campaigns for awareness, traffic, lead generation, promotion, acquisition, retargeting, sales, and conversions." },
      ] },
      { key: "growth-stages", heading: "Social Media Marketing for Every Stage of Growth", items: [
        { title: "For Businesses", description: "Align social activity with broader goals, from awareness to qualified leads." },
        { title: "For Small Businesses", description: "Build credibility, reach local audiences, and compete effectively with a focused strategy and budget." },
        { title: "For Startups", description: "Introduce your brand, communicate what makes it different, and build a community from day one." },
        { title: "For Established Brands", description: "Strengthen recognition through consistent messaging, storytelling, and a presence that reflects the brand." },
        { title: "For eCommerce", description: "Showcase products, engage buyers, drive targeted traffic, and support organic and paid sales." },
      ] },
      { key: "social-difference", heading: "Why Businesses Choose RaahX for Social Media", items: [
        { title: "Strategy Comes Before Content", description: "Every campaign starts with your audience, objective, and desired outcome." },
        { title: "Creative Meets Data", description: "Engaging content paired with performance insight allows the strategy to evolve." },
        { title: "Engagement That Builds Relationships", description: "We focus on interactions that build trust and keep people coming back." },
        { title: "Results You Can Actually Measure", description: "Clear analytics show what works and how your investment contributes to growth." },
      ] },
      { key: "social-goals", heading: "Your Social Media, Working Toward Real Business Goals", body: "Social media should do more than collect likes and followers. When strategy, content, community management, paid social, and analytics work together, social channels become a genuine part of customer acquisition and growth.", items: [] },
      { key: "faqs", eyebrow: "Frequently Asked Questions", heading: "Social Media Marketing Questions, Answered", items: [
        { title: "Which social media platforms should my business actually be on?", description: "It depends on where your customers spend time, not which platform is trending. A B2B company may gain more from LinkedIn while an eCommerce brand may gain more from Instagram." },
        { title: "How long does it take to see results from social media marketing?", description: "Paid social can generate traffic and leads within days. Organic growth, engagement, and community trust usually build over several months." },
        { title: "Do you handle both organic content and paid advertising?", description: "Yes. We manage organic content, community engagement, and paid campaigns together under the same strategy." },
        { title: "Will I have input on the content before it goes live?", description: "Yes. We share content calendars and creative for review so you can provide input on tone, messaging, and timing." },
        { title: "How do you measure whether a campaign is actually working?", description: "We look beyond likes and followers to engagement rate, website traffic, lead generation, and conversions tied to business goals." },
      ] },
    ],
    ctaTitle: "Ready to Turn Social Media Into a Growth Channel?",
    ctaText: "Your audience is already on social media. Let's give them a reason to notice, trust, and choose your brand.",
    ctaSupportingText: "Get a customized, data-driven social media roadmap built around your goals.",
    ctaLabel: "Get Your Free Proposal",
  },
  "seo-services": {
    cardDescription: "Increase organic visibility, attract high-intent traffic, improve search rankings, and generate sustainable growth with research-driven SEO strategies.",
    cardCtaLabel: "Explore SEO Services",
    heroTitle: "Increase Organic Traffic and Build Long-Term Business Growth",
    heroSubtitle: "Get found by the right customers when they search for your products or services. Our data-driven SEO strategies improve search visibility, attract qualified traffic, and turn organic visitors into customers.",
    heroCtaLabel: "Get Your Free SEO Proposal",
    overviewTitle: "Turn Google Searches Into Real Business Growth",
    overview: "Your customers are already searching for the products and services you offer. Our SEO services help your business appear in front of them at the exact moment they are ready to take action.\n\nFrom technical SEO and keyword research to content optimization, local SEO, and authority building, we create a complete search strategy designed around your business goals — not just rankings.",
    whyChooseTitle: "Why Choose Our SEO Services?",
    whyChooseText: "Search engines are constantly changing, but the fundamentals remain the same: a technically strong website, valuable content, relevant keywords, strong authority, and an excellent user experience.\n\nWe combine these elements into one strategic SEO campaign designed to increase organic visibility, attract qualified visitors, and generate sustainable business growth.\n\nNo shortcuts. No keyword stuffing. No dependence on paid advertising. Just a structured SEO strategy built for long-term results.",
    processTitle: "How We Make It Happen",
    process: [
      { title: "Technical SEO Audit", description: "We identify and fix issues that prevent crawling, understanding, and indexing. Includes: crawling and indexing, site architecture, Core Web Vitals, mobile usability, canonicals, redirects, schema, and XML sitemaps." },
      { title: "Keyword & Competitor Research", description: "We find customer search terms and analyze competitors. Includes: keyword research, search intent, competitor analysis, keyword gaps, SERP analysis, and commercial opportunities." },
      { title: "On-Page & Content Optimization", description: "We optimize pages and build a content strategy. Includes: title tags, meta descriptions, headings, content optimization, internal linking, semantic keywords, and search-intent optimization." },
      { title: "Authority Building", description: "We strengthen authority using link opportunities, digital PR, relevant backlinks, brand mentions, local citations, and sustainable authority development." },
    ],
    benefitsTitle: "Your Unfair Advantage",
    benefits: [
      { title: "Sustainable Traffic", description: "Build a consistent stream of qualified organic visitors without relying entirely on paid advertising." },
      { title: "Higher Conversion Rates", description: "Target users with strong search intent and connect them with pages designed to convert." },
      { title: "Industry Authority", description: "Build a trusted resource recognized by search engines and customers in your market." },
    ],
    stats: [
      { label: "Keywords Ranked", value: "500+" },
      { label: "Average Traffic Growth", value: "124%" },
      { label: "Client Rating", value: "4.9★" },
    ],
    testimonial: { quote: "Our website rankings improved significantly, and we now receive consistent organic leads every month. The ROI has been incredible.", author: "Muhammad Ali" },
    contentSections: [
      { key: "seo-process", heading: "Our SEO Process", items: [
        { title: "Discover", description: "We learn about your business, customers, competitors, goals, and current search visibility." },
        { title: "Audit", description: "We analyze technical health, content, keywords, backlinks, and overall SEO performance." },
        { title: "Strategize", description: "We build a prioritized SEO roadmap around the opportunities with the greatest business impact." },
        { title: "Optimize", description: "We improve site structure, pages, content, internal links, technical SEO, and conversion elements." },
        { title: "Grow", description: "We monitor rankings, traffic, conversions, competitors, and new search opportunities." },
        { title: "Scale", description: "We expand into new keywords, topics, locations, services, and revenue opportunities." },
      ] },
      { key: "seo-service-types", heading: "SEO Services We Provide", items: [
        { title: "Technical SEO", description: "Fix technical problems affecting crawling, indexing, performance, and search visibility." },
        { title: "On-Page SEO", description: "Optimize pages for relevant keywords, search intent, users, and search engines." },
        { title: "Keyword Research", description: "Find profitable keywords based on volume, competition, intent, and business value." },
        { title: "Content SEO", description: "Create and optimize helpful content that satisfies users and builds topical authority." },
        { title: "Local SEO", description: "Improve location-based visibility and help nearby customers find your business." },
        { title: "Ecommerce SEO", description: "Optimize product, category, collection, and supporting pages for organic ecommerce traffic." },
        { title: "Link Building", description: "Build relevant authority through outreach, digital PR, partnerships, and quality link opportunities." },
        { title: "SEO Audits", description: "Analyze technical, on-page, content, off-page, and competitive SEO opportunities." },
      ] },
      { key: "business-goals", heading: "Built Around Your Business Goals", items: [
        { title: "More Visibility", description: "Reach more people searching for what you offer." },
        { title: "More Qualified Traffic", description: "Attract visitors with genuine interest and buying intent." },
        { title: "More Leads", description: "Turn organic traffic into calls, forms, bookings, and enquiries." },
        { title: "More Revenue", description: "Build an SEO channel that contributes to sustainable business growth." },
      ] },
      { key: "seo-difference", heading: "What Makes Our SEO Different?", items: [
        { title: "Strategy Before Execution", description: "Every action starts with research and a clear objective rather than blind page optimization." },
        { title: "Data-Driven Decisions", description: "Search data, competitor insights, analytics, and ranking trends determine priorities." },
        { title: "Search Intent First", description: "We focus on why someone searches, not rankings that do not match your business." },
        { title: "Technical + Content + Authority", description: "We work across the entire search ecosystem because successful SEO requires more than content." },
        { title: "Transparent Reporting", description: "You can see what we are working on, what changed, and how organic performance is developing." },
      ] },
      { key: "faqs", eyebrow: "Frequently Asked Questions", heading: "SEO Questions, Answered", items: [
        { title: "How long does SEO take to show results?", description: "Some improvements appear within the first few months, while competitive keywords and industries require more time and consistent optimization." },
        { title: "What does an SEO campaign include?", description: "Technical SEO, keyword and competitor research, on-page optimization, content strategy, internal linking, local SEO, authority building, and ongoing monitoring." },
        { title: "Can you improve my existing website's rankings?", description: "Yes. We audit existing websites, identify barriers and missed opportunities, and create a prioritized optimization plan." },
        { title: "Do you guarantee first-page Google rankings?", description: "No reputable provider can guarantee a specific position. We improve the factors that influence visibility and build sustainable search growth." },
        { title: "Will SEO increase my leads and sales?", description: "SEO attracts relevant users actively searching for your offer, while results also depend on the offer, website experience, competition, and conversion process." },
        { title: "Do you provide local SEO?", description: "Yes. Local SEO improves location-based visibility and can generate nearby calls, enquiries, and visits." },
      ] },
    ],
    ctaTitle: "Turn Search Traffic Into Business Growth",
    ctaText: "Get a customized, data-driven SEO strategy tailored specifically to your business, market, and growth goals.",
    ctaSupportingText: "Free consultation • Customized strategy • No obligation",
    ctaLabel: "Get Your Free SEO Proposal",
  },
  "website-development": { cardDescription: "Create fast, responsive, SEO-friendly websites designed to build trust, improve user experience, and turn visitors into customers.", cardCtaLabel: "Explore Web Development" },
  "branding": { cardDescription: "Create a memorable brand identity with strategic positioning, visual identity, messaging, and creative assets built around your audience.", cardCtaLabel: "Explore Branding" },
  "meta-advertising": { name: "Meta Advertising", cardDescription: "Reach the right audience and generate measurable results through strategically planned Meta advertising campaigns optimized for conversions and growth.", cardCtaLabel: "Explore Meta Ads" },
  "ai-automation": { cardDescription: "Automate repetitive workflows, improve efficiency, and create smarter business processes using practical AI and marketing automation solutions.", cardCtaLabel: "Explore AI Automation" },
  "graphic-design": { cardDescription: "Create professional, conversion-focused visuals that strengthen your brand across websites, social media, advertising, and digital campaigns.", cardCtaLabel: "Explore Graphic Design" },
  "business-strategy": { cardDescription: "Turn business goals into actionable growth plans with market research, competitive analysis, strategic planning, and performance insights.", cardCtaLabel: "Explore Growth Consulting" },
  "app-development": { cardDescription: "Build scalable, user-friendly applications that support your digital ecosystem, customer experience, and long-term business growth.", cardCtaLabel: "Explore App Development" },
};

export const servicesData: ServiceData[] = baseServicesData.map((service) => ({
  ...service,
  ...(documentedServiceContent[service.slug] ?? {}),
}));
