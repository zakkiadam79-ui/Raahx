import { ArrowUpRight, BadgeCheck, Heart, Instagram, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatCreatorCount,
  isValidCreatorProfileUrl,
  type CreatorProfile,
} from "../../data/creatorsData";

export default function CreatorCard({
  creator,
  saved,
  onSave,
  list = false,
}: {
  creator: CreatorProfile;
  saved: boolean;
  onSave: () => void;
  list?: boolean;
}) {
  const instagramUrl = creator.socials.find(
    (social) => social.platform === "Instagram" && isValidCreatorProfileUrl(social.profile_url),
  )?.profile_url;

  return (
    <article className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${list ? "sm:flex" : ""}`}>
      <div className={`relative overflow-hidden bg-slate-100 ${list ? "h-64 sm:h-auto sm:w-56 shrink-0" : "h-64"}`}>
        <img
          src={creator.image}
          alt={creator.name}
          width={600}
          height={760}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm">
          <BadgeCheck size={13} /> Verified
        </span>
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? `Remove ${creator.name} from saved creators` : `Save ${creator.name}`}
          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-sm transition-colors ${saved ? "text-rose-500" : "text-gray-500 hover:text-rose-500"}`}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-secondary/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {creator.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-heading text-lg font-bold text-secondary">{creator.name}</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={13} className="text-primary" /> {creator.city}, {creator.region}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">{creator.shortBio}</p>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${creator.name} on Instagram`}
              className="flex items-center gap-1.5 rounded-md text-sm font-semibold text-secondary transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Instagram size={15} className="text-primary" /> {formatCreatorCount(creator.followers)}
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
              <Instagram size={15} className="text-primary" /> {formatCreatorCount(creator.followers)}
            </span>
          )}
          <span className="text-xs text-gray-500">{creator.engagement}% engagement</span>
        </div>
        <Link
          to={`/creator-network/${creator.id}`}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          View Profile <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
