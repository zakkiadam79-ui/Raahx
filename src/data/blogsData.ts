export interface BlogContentBlock {
  type: "paragraph" | "heading";
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  serviceSlug: string;
  date: string;
  readTime: string;
  author: string;
  content: BlogContentBlock[];
}

export const blogsData: BlogPost[] = [
  {
    slug: "seo-fundamentals-2026",
    title: "SEO in 2026: What Actually Moves the Needle Now",
    excerpt:
      "Search has changed more in the last two years than in the decade before it. Here's what's still worth your time, and what to drop.",
    serviceSlug: "seo-services",
    date: "Jul 22, 2026",
    readTime: "6 min read",
    author: "RaahX Team",
    content: [
      {
        type: "paragraph",
        text: "Search engines don't just index pages anymore, they interpret intent. That shift changes what 'ranking' actually means, and it's why so many businesses still doing 2019-style SEO see their traffic quietly decline year over year without knowing why.",
      },
      { type: "heading", text: "Content depth beats content volume" },
      {
        type: "paragraph",
        text: "Publishing more thin articles used to work. It doesn't anymore. A single, thorough page that genuinely answers a searcher's question will consistently outperform ten shallow posts targeting the same keyword.",
      },
      { type: "heading", text: "Technical health is no longer optional" },
      {
        type: "paragraph",
        text: "Site speed, mobile usability, and clean structured data aren't 'nice to have' anymore, they're baseline requirements.",
      },
      { type: "heading", text: "Local signals matter more for service businesses" },
      {
        type: "paragraph",
        text: "For businesses serving a specific city or region, a well-maintained Google Business Profile, consistent citations, and genuine customer reviews often move the needle faster than any blog post will.",
      },
    ],
  },
  {
    slug: "social-media-strategy-that-converts",
    title: "Stop Posting for Likes. Start Posting for Leads.",
    excerpt:
      "Vanity metrics feel good, but they rarely pay the bills. Here's how to build a social strategy that actually drives business results.",
    serviceSlug: "social-media-marketing",
    date: "Jul 10, 2026",
    readTime: "5 min read",
    author: "RaahX Team",
    content: [
      {
        type: "paragraph",
        text: "A post with ten thousand likes and zero inquiries has done nothing for your business. Yet most brands still measure social media success by reach and engagement alone.",
      },
      { type: "heading", text: "Every post needs a job" },
      {
        type: "paragraph",
        text: "Before publishing anything, ask what that specific post is supposed to do: build trust, answer an objection, showcase proof, or drive a click.",
      },
      { type: "heading", text: "Proof beats polish" },
      {
        type: "paragraph",
        text: "Behind-the-scenes clips, real client results, and honest process breakdowns consistently outperform heavily produced brand content.",
      },
      { type: "heading", text: "Match the platform to the goal" },
      {
        type: "paragraph",
        text: "Instagram and TikTok are strong for awareness and brand personality. LinkedIn tends to convert better for B2B and higher-ticket services.",
      },
    ],
  },
  {
    slug: "branding-vs-logo-design",
    title: "Your Logo Isn't Your Brand (And That's a Problem)",
    excerpt:
      "A lot of businesses think they've 'done branding' once they have a logo. Here's why that's only the surface, and what actually builds a brand.",
    serviceSlug: "branding",
    date: "Jun 28, 2026",
    readTime: "5 min read",
    author: "RaahX Team",
    content: [
      {
        type: "paragraph",
        text: "A logo is a symbol. A brand is everything a customer feels and remembers about you, from the tone of your emails to the five seconds after they land on your website.",
      },
      { type: "heading", text: "Consistency builds recognition faster than creativity" },
      {
        type: "paragraph",
        text: "A brand that shows up the same way everywhere becomes instantly recognizable far quicker than one that reinvents itself with every campaign.",
      },
      { type: "heading", text: "Positioning comes before design" },
      {
        type: "paragraph",
        text: "Before choosing a single color or font, a brand needs a clear answer to one question: why should someone choose you over the next option?",
      },
      { type: "heading", text: "Your brand is tested in the small moments" },
      {
        type: "paragraph",
        text: "How you write an invoice email. How your team answers a complaint. These unglamorous touchpoints shape brand perception.",
      },
    ],
  },
  {
    slug: "website-that-actually-sells",
    title: "Most Websites Are Digital Brochures. Yours Shouldn't Be.",
    excerpt:
      "A beautiful site that doesn't convert is just an expensive brochure. Here's what separates a site that looks good from one that sells.",
    serviceSlug: "website-development",
    date: "Jun 15, 2026",
    readTime: "7 min read",
    author: "RaahX Team",
    content: [
      {
        type: "paragraph",
        text: "It's easy to fall in love with a beautifully designed website and forget to ask the only question that actually matters: does it get visitors to take action?",
      },
      { type: "heading", text: "Speed is a conversion feature, not a technical detail" },
      {
        type: "paragraph",
        text: "Every additional second of load time measurably increases the chance a visitor leaves before seeing what you offer.",
      },
      { type: "heading", text: "Every page needs one clear next step" },
      {
        type: "paragraph",
        text: "A page offering five different actions usually gets none of them done well. The strongest pages guide a visitor toward a single, obvious next step.",
      },
      { type: "heading", text: "Trust signals do heavy lifting" },
      {
        type: "paragraph",
        text: "Real client results, clear pricing or process information, and genuine testimonials reduce hesitation at exactly the moment a visitor is deciding whether to commit.",
      },
    ],
  },
  {
    slug: "ai-automation-small-business",
    title: "AI Automation Isn't Just for Big Companies Anymore",
    excerpt:
      "Chatbots, automated follow-ups, and smart workflows used to require a dev team. Now a small business can set them up in a week.",
    serviceSlug: "ai-automation",
    date: "May 30, 2026",
    readTime: "6 min read",
    author: "RaahX Team",
    content: [
      {
        type: "paragraph",
        text: "Today, workflows can be built and running within days, without writing a single line of code.",
      },
      { type: "heading", text: "Start with repetitive, not complex" },
      {
        type: "paragraph",
        text: "The best first automation is the task your team repeats every single day.",
      },
      { type: "heading", text: "A chatbot's job is to qualify, not replace" },
      {
        type: "paragraph",
        text: "They ask the right questions, filter out unqualified inquiries, and hand warm leads to a real person.",
      },
      { type: "heading", text: "Automation should feel invisible to the customer" },
      {
        type: "paragraph",
        text: "The goal is to make the customer's experience faster and smoother than it was before.",
      },
    ],
  },
  {
    slug: "growth-strategy-beyond-ads",
    title: "Why Ad Spend Alone Won't Fix a Broken Growth Strategy",
    excerpt:
      "Throwing more budget at ads is the most common fix businesses reach for, and often the least effective one. Here's what to check first.",
    serviceSlug: "business-strategy",
    date: "May 12, 2026",
    readTime: "6 min read",
    author: "RaahX Team",
    content: [
      {
        type: "paragraph",
        text: "When growth stalls, the instinct is almost always to spend more on ads. But if the underlying offer is broken, more traffic just means more people seeing leaks.",
      },
      { type: "heading", text: "Traffic isn't the bottleneck it looks like" },
      {
        type: "paragraph",
        text: "Most businesses we audit aren't short on visitors, they're short on conversions.",
      },
      { type: "heading", text: "Follow-up speed changes everything" },
      {
        type: "paragraph",
        text: "A lead that waits 24 hours for a response converts at a fraction of the rate of one contacted within minutes.",
      },
      { type: "heading", text: "Growth compounds when the whole system works together" },
      {
        type: "paragraph",
        text: "Ads bring attention. Branding builds trust. A strong website converts. Fast follow-up closes.",
      },
    ],
  },
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}