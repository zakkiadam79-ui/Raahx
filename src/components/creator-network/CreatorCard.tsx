import { ArrowUpRight, BadgeCheck, Heart, Instagram, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CreatorRecord } from "../../services/creatorStore";

const formatCount = (count: number) => count >= 1_000_000 ? `${(count / 1_000_000).toFixed(1).replace(".0", "")}M` : count >= 1_000 ? `${Math.round(count / 1_000)}K` : String(count);

export default function CreatorCard({ creator, saved, onSave, list = false }: { creator: CreatorRecord; saved: boolean; onSave: () => void; list?: boolean }) {
  const instagram = creator.socials.find((social) => social.platform.toLowerCase() === "instagram");
  return (
    <article className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${list ? "sm:flex" : ""}`}>
      <div className={`relative overflow-hidden bg-slate-100 ${list ? "h-64 sm:h-auto sm:w-56 shrink-0" : "h-64"}`}>
        <img src={creator.profile_image_url || "/logo.png"} alt={creator.display_name} width={600} height={760} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = "/logo.png"; }} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {creator.is_verified && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm"><BadgeCheck size={13} /> Verified</span>}
        <button type="button" onClick={onSave} aria-label={saved ? `Remove ${creator.display_name} from saved creators` : `Save ${creator.display_name}`} className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-sm ${saved ? "text-rose-500" : "text-gray-500 hover:text-rose-500"}`}><Heart size={16} fill={saved ? "currentColor" : "none"} /></button>
        {creator.categories[0] && <span className="absolute bottom-3 left-3 rounded-full bg-secondary/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{creator.categories[0]}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-heading text-lg font-bold text-secondary">{creator.display_name}</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin size={13} className="text-primary" /> {creator.city || "Location not listed"}{creator.region ? `, ${creator.region}` : ""}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">{creator.short_bio || "Creator profile"}</p>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          {instagram ? <a href={instagram.profile_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${creator.display_name} on Instagram`} className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"><Instagram size={15} className="text-primary" /> {formatCount(creator.followers)}</a> : <span className="text-sm font-semibold text-secondary">{formatCount(creator.followers)} followers</span>}
          <span className="text-xs text-gray-500">{creator.engagement_rate}% engagement</span>
        </div>
        <Link to={`/creator-network/${creator.id}`} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">View Profile <ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}
