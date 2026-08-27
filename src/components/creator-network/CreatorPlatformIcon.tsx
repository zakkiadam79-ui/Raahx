import { Facebook, Instagram, Linkedin, Music2, Youtube } from "lucide-react";

export function platformKind(platform: string) {
  const value = platform.trim().toLowerCase();
  if (value.includes("instagram")) return "instagram";
  if (value.includes("tik")) return "tiktok";
  if (value.includes("youtube")) return "youtube";
  if (value.includes("facebook")) return "facebook";
  if (value.includes("linkedin")) return "linkedin";
  return "other";
}

export default function CreatorPlatformIcon({ platform, size = 16, boxed = false }: { platform: string; size?: number; boxed?: boolean }) {
  const kind = platformKind(platform);
  const icon = kind === "instagram" ? <Instagram size={size} />
    : kind === "tiktok" ? <Music2 size={size} />
    : kind === "youtube" ? <Youtube size={size} />
    : kind === "facebook" ? <Facebook size={size} />
    : kind === "linkedin" ? <Linkedin size={size} />
    : <span className="text-xs font-black">@</span>;
  const colors = kind === "instagram" ? "bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 text-white"
    : kind === "tiktok" ? "bg-black text-white"
    : kind === "youtube" ? "bg-red-600 text-white"
    : kind === "facebook" ? "bg-blue-600 text-white"
    : kind === "linkedin" ? "bg-[#0A66C2] text-white"
    : "bg-primary text-white";
  return boxed ? <span className={`inline-grid shrink-0 place-items-center rounded-lg ${colors}`} style={{ width: size + 18, height: size + 18 }}>{icon}</span>
    : <span className={kind === "instagram" ? "text-pink-500" : kind === "youtube" ? "text-red-600" : kind === "facebook" || kind === "linkedin" ? "text-blue-600" : kind === "tiktok" ? "text-black" : "text-primary"}>{icon}</span>;
}
