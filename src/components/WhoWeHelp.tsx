import { BriefcaseBusiness, ShoppingCart, Store } from "lucide-react";

const audiences = [
  {
    eyebrow: "B2B Businesses",
    title: "B2B Digital Marketing Agency",
    description: "Generate qualified leads, build authority, reach decision-makers, and create a stronger B2B marketing pipeline through SEO, content, paid advertising, and strategic digital campaigns.",
    icon: BriefcaseBusiness,
  },
  {
    eyebrow: "eCommerce Brands",
    title: "eCommerce Digital Marketing Agency",
    description: "Increase qualified traffic, improve conversions, reduce acquisition costs, and grow online revenue through integrated SEO, paid advertising, social media, and conversion strategies.",
    icon: ShoppingCart,
  },
  {
    eyebrow: "Small Businesses",
    title: "Digital Marketing Agency for Small Business",
    description: "Get a focused digital strategy designed around your budget and growth goals. We help small businesses improve visibility, attract customers, generate leads, and compete more effectively online.",
    icon: Store,
  },
];

export default function WhoWeHelp() {
  return <section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="mx-auto mb-14 max-w-3xl text-center"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Who We Help</p><h2 className="font-heading text-3xl font-bold text-secondary md:text-4xl">Digital Marketing Built for Different Types of Businesses</h2><p className="mt-5 leading-7 text-gray-600">Every business has different customers, competition, and growth challenges. RAAHX develops digital marketing strategies around your business model, market, and goals.</p></div><div className="grid gap-6 md:grid-cols-3">{audiences.map((audience) => { const Icon = audience.icon; return <article key={audience.title} className="rounded-3xl border border-gray-100 bg-surface p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={23} /></span><p className="mt-6 text-xs font-bold uppercase tracking-wider text-primary">{audience.eyebrow}</p><h3 className="mt-2 font-heading text-xl font-bold text-secondary">{audience.title}</h3><p className="mt-4 text-sm leading-6 text-gray-600">{audience.description}</p></article>; })}</div></div></section>;
}
