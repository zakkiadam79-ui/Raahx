export interface ApproachStep {
  title: string;
  description: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface CaseStudyData {
  slug: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  overview: string;
  approach: ApproachStep[];
  metrics: Metric[];
  testimonial: Testimonial;
}

export const defaultCaseStudies: CaseStudyData[] = [
  {
    slug: "ecommerce-brand",
    client: "E-Commerce Brand",
    industry: "E-Commerce",
    challenge: "Struggling with high customer acquisition costs and low retention rates in a competitive market.",
    solution: "Implemented an AI-driven predictive bidding strategy and personalized email automation workflows.",
    overview: "This e-commerce brand was spending heavily on ads but seeing diminishing returns, with rising acquisition costs and one-time buyers who rarely came back. RaahX rebuilt their growth engine from the ground up—combining predictive, AI-driven ad bidding with personalized email flows designed to turn first-time buyers into repeat customers.",
    approach: [
      { title: "Audit & Diagnosis", description: "We analyzed campaign performance, customer journeys, and retention data to pinpoint exactly where budget was being wasted." },
      { title: "Predictive Bidding Strategy", description: "We deployed AI-driven bidding to prioritize spend on the highest-intent, highest-value customers." },
      { title: "Personalized Email Automation", description: "We built automated email flows tailored to browsing and purchase behavior to drive repeat purchases." },
      { title: "Continuous Optimization", description: "We monitored performance weekly, refining targeting and creative to compound results over time." },
    ],
    metrics: [
      { label: "ROAS", value: "346%" },
      { label: "Revenue", value: "7.5X" },
      { label: "CPA Reduction", value: "42%" },
    ],
    testimonial: { quote: "RaahX didn't just lower our ad costs—they built a system that keeps customers coming back. Our revenue growth has been the strongest we've ever seen.", author: "E-Commerce Client" },
  },
  {
    slug: "b2b-saas-platform",
    client: "B2B SaaS Platform",
    industry: "B2B SaaS",
    challenge: "Needed to generate high-quality enterprise leads and establish thought leadership.",
    solution: "Launched targeted LinkedIn ABM campaigns paired with high-value technical whitepapers.",
    overview: "This B2B SaaS platform needed to break into enterprise accounts but lacked the targeted outreach and credibility content to get in front of decision-makers. RaahX built an account-based marketing strategy on LinkedIn, backed by in-depth technical whitepapers that positioned the brand as a serious authority in its space.",
    approach: [
      { title: "LinkedIn ABM Campaign Design", description: "We identified and targeted key decision-makers at high-value enterprise accounts." },
      { title: "Technical Whitepaper Creation", description: "We produced authoritative content that established credibility and generated qualified interest." },
      { title: "Targeted Outreach & Nurture", description: "We built nurture sequences to move engaged leads through the pipeline efficiently." },
      { title: "Pipeline Tracking & Optimization", description: "We tracked MQL-to-pipeline conversion closely, refining targeting to maximize deal value." },
    ],
    metrics: [
      { label: "MQLs", value: "22K" },
      { label: "Conversion", value: "139%" },
      { label: "Pipeline", value: "4.2M" },
    ],
    testimonial: { quote: "RaahX helped us finally break into enterprise accounts we'd been chasing for years. The quality of leads and pipeline growth exceeded what we thought was possible.", author: "B2B SaaS Client" },
  }
];