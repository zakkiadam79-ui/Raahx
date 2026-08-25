import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Instagram,
  MapPin,
  MessageCircle,
  Play,
  Users,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { creators, formatCreatorCount } from "../data/creatorsData";

export default function CreatorDetail() {
  const { id } = useParams();
  const creator = creators.find((item) => item.id === Number(id));
  if (!creator) return <Navigate to="/creator-network" replace />;

  return (
    <main className="min-h-screen bg-surface pt-24 md:pt-28">
      <section className="border-b border-gray-100 bg-white py-5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link to="/creator-network" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"><ArrowLeft size={16} /> Back to all creators</Link>
        </div>
      </section>

      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[minmax(280px,420px)_1fr] md:items-center lg:px-8">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-slate-100 shadow-xl md:mx-0">
            <img src={creator.image} alt={creator.name} width={800} height={1000} className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow"><BadgeCheck size={15} /> Verified Creator</span>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">{creator.categories.map((tag) => <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{tag}</span>)}</div>
            <h1 className="mt-5 font-heading text-4xl font-bold text-secondary md:text-5xl">{creator.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500"><MapPin size={16} className="text-primary" /> {creator.city}, {creator.region}, Pakistan</p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">{creator.shortBio}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#collaborate" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark">Collaborate with creator <ArrowRight size={16} /></a>
              <a href="#about" className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-secondary hover:border-primary"><Play size={15} /> View profile</a>
            </div>
            <div className="mt-9 grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-100">
              <Stat icon={Users} value={`${formatCreatorCount(creator.followers)}+`} label="Followers" />
              <Stat icon={BarChart3} value={`${creator.engagement}%`} label="Engagement" />
              <Stat icon={BadgeCheck} value={`${creator.compatibility}%`} label="Brand match" />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-8">
            <article className="rounded-3xl border border-gray-100 bg-white p-6 md:p-9">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Profile</span>
              <h2 className="mt-2 font-heading text-2xl font-bold text-secondary">About the creator</h2>
              <p className="mt-5 leading-8 text-gray-600">{creator.about}</p>
            </article>
            <article className="rounded-3xl border border-gray-100 bg-white p-6 md:p-9">
              <h2 className="font-heading text-2xl font-bold text-secondary">Content expertise</h2>
              <div className="mt-5 flex flex-wrap gap-2">{creator.expertise.map((tag) => <span key={tag} className="rounded-full border border-primary/15 bg-teal-50 px-4 py-2 text-sm font-medium text-primary">{tag}</span>)}</div>
            </article>
            <article className="rounded-3xl border border-gray-100 bg-white p-6 md:p-9">
              <h2 className="font-heading text-2xl font-bold text-secondary">Available for collaborations</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {["Reels & short videos", "Sponsored posts", "Brand campaigns", "Event coverage", "Product promotion", "Content production"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-surface p-4 text-sm font-semibold text-gray-700"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary"><Check size={14} /></span>{item}</div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-[#082f2a] p-7 text-white">
              <h2 className="font-heading text-xl font-bold text-white">Social presence</h2>
              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-primary"><Instagram size={21} /></span>
                <div><p className="text-sm font-bold text-white">Instagram</p><p className="text-xs text-white/60">{creator.handle}</p></div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/65">Also active on {creator.platforms.slice(1).join(", ")}.</p>
            </div>
            <div id="collaborate" className="scroll-mt-28 rounded-3xl border border-primary/15 bg-white p-7 shadow-lg">
              <MessageCircle size={25} className="text-primary" />
              <h2 className="mt-4 font-heading text-xl font-bold text-secondary">Start a collaboration</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">Share your campaign goals with the RaahX team and we'll guide the next steps.</p>
              <Link to="/proposal" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Request collaboration <ArrowRight size={16} /></Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return <div className="border-r border-gray-100 p-4 text-center last:border-r-0"><Icon size={17} className="mx-auto mb-2 text-primary" /><strong className="block font-heading text-lg text-secondary md:text-xl">{value}</strong><span className="text-[10px] text-gray-500 sm:text-xs">{label}</span></div>;
}
