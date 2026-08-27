import { ArrowRight, BadgeCheck, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CreatorRecord } from "../../services/creatorStore";
import CreatorImage from "./CreatorImage";
import CreatorPlatformIcon from "./CreatorPlatformIcon";

const formatCount=(n:number)=>n>=1e6?`${(n/1e6).toFixed(1).replace('.0','')}M`:n>=1e3?`${Math.round(n/1e3)}K`:String(n);
export default function CreatorCard({creator,saved,onSave,list=false}:{creator:CreatorRecord;saved:boolean;onSave:()=>void;list?:boolean}){
 return <article className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl ${list?'sm:flex':''}`}>
  <div className={`relative shrink-0 ${list?'h-64 sm:h-auto sm:w-56':'aspect-[4/3]'}`}><CreatorImage src={creator.profile_image_url} alt={creator.display_name} className="h-full w-full"/>{creator.is_verified&&<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white shadow"><BadgeCheck size={12}/>Verified</span>}<button type="button" onClick={onSave} aria-label={saved?`Remove ${creator.display_name} from favorites`:`Favorite ${creator.display_name}`} aria-pressed={saved} className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white shadow ${saved?'text-rose-500':'text-gray-600'}`}><Heart size={16} fill={saved?'currentColor':'none'}/></button>{creator.categories[0]&&<span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-secondary shadow">{creator.categories[0]}</span>}</div>
  <div className="flex flex-1 flex-col p-4"><h2 className="truncate font-heading text-base font-bold text-secondary">{creator.display_name}</h2><p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500"><MapPin size={12} className="text-primary"/>{creator.city||"Location not listed"}{creator.region?`, ${creator.region}`:""}</p><p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">{creator.short_bio||"Creator profile"}</p>
   <div className="mt-4 flex min-h-6 flex-wrap items-center gap-x-3 gap-y-2">{creator.socials.slice(0,3).map((social,index)=><a key={`${social.profile_url}-${index}`} href={social.profile_url} target="_blank" rel="noopener noreferrer" title={`${social.platform}: ${formatCount(social.follower_count)}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 hover:text-primary"><CreatorPlatformIcon platform={social.platform} size={13}/>{formatCount(social.follower_count)}</a>)}</div>
   <Link to={`/creator-network/${creator.id}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">View Profile <ArrowRight size={14}/></Link>
  </div>
 </article>;
}
