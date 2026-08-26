import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Filter, Grid2X2, Handshake, List, Loader2, Search, Users, X } from "lucide-react";
import CreatorCard from "../components/creator-network/CreatorCard";
import { creatorError, fetchPublicCreators, type CreatorRecord } from "../services/creatorStore";
import { getDemoCreators } from "../services/creatorDemoAdapter";

type Sort = "display_order" | "followers" | "engagement" | "name";

export default function CreatorNetwork() {
  const [creators, setCreators] = useState<CreatorRecord[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [sort, setSort] = useState<Sort>("display_order");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const real = await fetchPublicCreators({ sort: "display_order" });
      setCreators(real.length ? real : getDemoCreators());
      setIsDemo(real.length === 0);
    } catch (failure) {
      setCreators([]); setIsDemo(false); setError(creatorError(failure));
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const categories = useMemo(() => Array.from(new Set(creators.flatMap((creator) => creator.categories))).sort(), [creators]);
  const cities = useMemo(() => Array.from(new Set(creators.map((creator) => creator.city).filter((value): value is string => Boolean(value)))).sort(), [creators]);
  const platforms = useMemo(() => Array.from(new Set(creators.flatMap((creator) => creator.socials.map((social) => social.platform)))).sort(), [creators]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = creators.filter((creator) => {
      const haystack = `${creator.display_name} ${creator.short_bio ?? ""} ${creator.city ?? ""} ${creator.categories.join(" ")} ${creator.expertise.join(" ")}`.toLowerCase();
      return (!term || haystack.includes(term)) && (category === "All" || creator.categories.includes(category)) && (city === "All" || creator.city === city) && (platform === "All" || creator.socials.some((social) => social.platform === platform));
    });
    return [...result].sort((a, b) => sort === "followers" ? b.followers - a.followers : sort === "engagement" ? b.engagement_rate - a.engagement_rate : sort === "name" ? a.display_name.localeCompare(b.display_name) : a.display_order - b.display_order);
  }, [creators, query, category, city, platform, sort]);
  const reset = () => { setQuery(""); setCategory("All"); setCity("All"); setPlatform("All"); };
  const filters = <div className="space-y-5"><Select label="Category" value={category} values={categories} onChange={setCategory} /><Select label="City" value={city} values={cities} onChange={setCity} /><Select label="Platform" value={platform} values={platforms} onChange={setPlatform} /><button onClick={reset} className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary">Clear filters</button></div>;

  return (
    <main className="min-h-screen bg-surface pt-24 md:pt-28">
      <section className="relative overflow-hidden bg-[#082f2a] py-16 text-white md:py-24">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-teal-100"><BadgeCheck size={15} /> RAAHX CREATOR NETWORK</span><h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">Find the perfect creator <span className="text-teal-300">for your brand.</span></h1><p className="mt-6 max-w-2xl text-base leading-relaxed text-teal-50/75 md:text-lg">Explore verified content creators and connect with the right voice for authentic brand stories.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#directory" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#082f2a]">Explore Creators <ArrowRight size={17} /></a><Link to="/creator-network/join" className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white">Join as a Creator</Link></div></div>
          <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">{[[BadgeCheck,"Verified Creators"],[Users,"Diverse Categories"],[Handshake,"Easy Collaboration"]].map(([Icon,title]) => { const I=Icon as typeof BadgeCheck; return <div key={title as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4"><I size={22} className="text-teal-300" /><p className="text-sm font-bold text-white">{title as string}</p></div>; })}</div>
        </div>
      </section>
      <section id="directory" className="scroll-mt-24 py-14 md:py-20"><div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8"><span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Creator directory</span><h2 className="mt-2 font-heading text-3xl font-bold text-secondary md:text-4xl">Meet voices that move audiences</h2>{isDemo && <p className="mt-3 text-xs text-amber-700">Demo profiles are shown until the first published Creator is available.</p>}</div>
        {loading ? <div className="flex items-center justify-center gap-3 rounded-2xl bg-white py-24 text-gray-500"><Loader2 className="animate-spin text-primary" /> Loading creators...</div> : error ? <div className="rounded-2xl border border-red-200 bg-white p-10 text-center"><p className="text-red-600">{error}</p><button onClick={() => void load()} className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white">Retry</button></div> : <>
          <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_auto_auto]"><label className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators..." className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"><option value="display_order">Recommended</option><option value="followers">Most Followers</option><option value="engagement">Highest Engagement</option><option value="name">A–Z</option></select><button onClick={() => setMobileFilters(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold lg:hidden"><Filter size={17} /> Filters</button></div>
          <div className="grid items-start gap-8 lg:grid-cols-[240px_1fr]"><aside className="sticky top-28 hidden rounded-2xl border border-gray-100 bg-white p-5 lg:block">{filters}</aside><div><div className="mb-5 flex items-center justify-between"><p className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> creators</p><div className="hidden overflow-hidden rounded-lg border bg-white sm:flex"><button onClick={() => setLayout("grid")} className={`p-2.5 ${layout === "grid" ? "bg-primary text-white" : ""}`} aria-label="Grid view"><Grid2X2 size={16} /></button><button onClick={() => setLayout("list")} className={`p-2.5 ${layout === "list" ? "bg-primary text-white" : ""}`} aria-label="List view"><List size={17} /></button></div></div>{filtered.length ? <div className={layout === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-5"}>{filtered.map((creator) => <CreatorCard key={creator.id} creator={creator} list={layout === "list"} saved={saved.includes(creator.id)} onSave={() => setSaved((current) => current.includes(creator.id) ? current.filter((id) => id !== creator.id) : [...current, creator.id])} />)}</div> : <div className="rounded-2xl bg-white py-20 text-center text-gray-500">No creators match these filters.</div>}</div></div>
        </>}
      </div></section>
      {mobileFilters && <div className="fixed inset-0 z-[80] bg-black/40 lg:hidden"><button aria-label="Close filters" className="absolute inset-0" onClick={() => setMobileFilters(false)} /><div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6"><div className="mb-6 flex justify-between"><h2 className="font-bold">Filters</h2><button onClick={() => setMobileFilters(false)}><X /></button></div>{filters}</div></div>}
    </main>
  );
}

function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="block text-sm font-bold text-secondary">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal"><option>All</option>{values.map((item) => <option key={item}>{item}</option>)}</select></label>;
}
