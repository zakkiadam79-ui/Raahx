import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Filter,
  Grid2X2,
  Handshake,
  List,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import CreatorCard from "../components/creator-network/CreatorCard";
import { creatorCategories, creatorCities, creators } from "../data/creatorsData";

export default function CreatorNetwork() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [sort, setSort] = useState("popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [saved, setSaved] = useState<number[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = creators.filter((creator) => {
      const searchable = `${creator.name} ${creator.category} ${creator.city} ${creator.expertise.join(" ")}`.toLowerCase();
      return (
        (!term || searchable.includes(term)) &&
        (category === "All" || creator.category === category) &&
        (city === "All" || creator.city === city) &&
        (platform === "All" || creator.platforms.includes(platform as "Instagram"))
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "engagement") return b.engagement - a.engagement;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.followers - a.followers;
    });
  }, [category, city, platform, query, sort]);

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setCity("All");
    setPlatform("All");
  };

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="Category">
        <FilterOption label="All Categories" checked={category === "All"} onChange={() => setCategory("All")} />
        {creatorCategories.map((item) => (
          <FilterOption key={item} label={item} checked={category === item} onChange={() => setCategory(item)} />
        ))}
      </FilterGroup>
      <FilterGroup title="City">
        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary"
        >
          <option value="All">All Cities</option>
          {creatorCities.map((item) => <option key={item}>{item}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup title="Platform">
        {["All", "Instagram", "TikTok", "YouTube", "Facebook"].map((item) => (
          <FilterOption key={item} label={item === "All" ? "All Platforms" : item} checked={platform === item} onChange={() => setPlatform(item)} />
        ))}
      </FilterGroup>
      <button type="button" onClick={clearFilters} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary">
        Clear all filters
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-surface pt-24 md:pt-28">
      <section className="relative overflow-hidden bg-[#082f2a] py-16 text-white md:py-24">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-teal-100">
              <BadgeCheck size={15} /> RAAHX CREATOR NETWORK
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
              Find the perfect creator <span className="text-teal-300">for your brand.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-teal-50/75 md:text-lg">
              Explore Pakistan's verified content creators and influencers. Connect with the right voice to grow your brand through authentic stories.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#directory" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#082f2a] hover:bg-teal-50">
                Explore Creators <ArrowRight size={17} />
              </a>
              <Link to="/creator-network/join" className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
                Join as a Creator
              </Link>
            </div>
          </div>
          <div className="mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              [BadgeCheck, "Verified Creators", "Quality & authenticity"],
              [Users, "Diverse Categories", "For every brand"],
              [Handshake, "Easy Collaboration", "Fast & professional"],
            ].map(([Icon, title, caption]) => {
              const FeatureIcon = Icon as typeof BadgeCheck;
              return (
                <div key={title as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
                  <FeatureIcon size={22} className="shrink-0 text-teal-300" />
                  <div><p className="text-sm font-bold text-white">{title as string}</p><p className="text-xs text-teal-50/60">{caption as string}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="directory" className="scroll-mt-24 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Creator directory</span>
              <h2 className="mt-2 font-heading text-3xl font-bold text-secondary md:text-4xl">Meet voices that move audiences</h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-gray-500">Search by specialty, location or platform to find the right creative partner for your next campaign.</p>
          </div>

          <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search creators by name, category or keyword..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 outline-none focus:border-primary">
              <option value="popular">Most Followers</option>
              <option value="engagement">Highest Engagement</option>
              <option value="name">Name A–Z</option>
            </select>
            <button type="button" onClick={() => setMobileFilters(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 lg:hidden">
              <Filter size={17} /> Filters
            </button>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="sticky top-28 hidden rounded-2xl border border-gray-100 bg-white p-5 lg:block">
              <div className="mb-6 flex items-center gap-2 font-heading font-bold text-secondary"><SlidersHorizontal size={18} className="text-primary" /> Filters</div>
              {filterPanel}
            </aside>

            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">Showing <strong className="text-secondary">{filtered.length}</strong> creators</p>
                <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white sm:flex">
                  <button type="button" onClick={() => setLayout("grid")} aria-label="Grid view" className={`p-2.5 ${layout === "grid" ? "bg-primary text-white" : "text-gray-500"}`}><Grid2X2 size={16} /></button>
                  <button type="button" onClick={() => setLayout("list")} aria-label="List view" className={`p-2.5 ${layout === "list" ? "bg-primary text-white" : "text-gray-500"}`}><List size={17} /></button>
                </div>
              </div>
              {filtered.length ? (
                <div className={layout === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-5"}>
                  {filtered.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      list={layout === "list"}
                      saved={saved.includes(creator.id)}
                      onSave={() => setSaved((current) => current.includes(creator.id) ? current.filter((id) => id !== creator.id) : [...current, creator.id])}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                  <Search className="mx-auto text-gray-300" size={36} />
                  <h3 className="mt-4 font-heading text-lg font-bold text-secondary">No creators match those filters</h3>
                  <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-primary">Reset filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl bg-primary px-6 py-10 text-center md:px-12 md:py-14">
            <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">Can't find the right creator for your brand?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/75 md:text-base">Tell our team what your campaign needs and we'll help identify the right creative match.</p>
            <Link to="/proposal" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary">Talk to RaahX Team <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {mobileFilters && (
        <div className="fixed inset-0 z-[80] bg-secondary/45 lg:hidden" role="dialog" aria-modal="true" aria-label="Creator filters">
          <button type="button" aria-label="Close filters" onClick={() => setMobileFilters(false)} className="absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-heading text-lg font-bold">Filters</h2><button type="button" onClick={() => setMobileFilters(false)} className="p-2"><X size={21} /></button></div>
            {filterPanel}
            <button type="button" onClick={() => setMobileFilters(false)} className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white">Show {filtered.length} creators</button>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset><legend className="mb-3 text-sm font-bold text-secondary">{title}</legend><div className="space-y-2.5">{children}</div></fieldset>;
}

function FilterOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-primary" /> {label}
    </label>
  );
}
