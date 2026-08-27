import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

export default function CreatorImage({ src, alt, className = "", priority = false }: { src: string | null; alt: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  if (failed) return <div className={`grid place-items-center bg-gradient-to-br from-teal-50 to-slate-100 text-primary ${className}`} role="img" aria-label={`${alt} photo unavailable`}><UserRound className="h-1/4 w-1/4" strokeWidth={1.4} /></div>;
  return <img src={src!} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
