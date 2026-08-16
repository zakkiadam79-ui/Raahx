import {
  BarChart3,
  Briefcase,
  Code2,
  Cpu,
  FileText,
  Globe2,
  Lightbulb,
  Mail,
  Megaphone,
  MonitorSmartphone,
  Palette,
  PenTool,
  Search,
  Share2,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SERVICE_ICON_OPTIONS = [
  { name: "Megaphone", label: "Megaphone · Marketing & Advertising", Icon: Megaphone },
  { name: "Search", label: "Search · SEO", Icon: Search },
  { name: "Share2", label: "Share · Social Media", Icon: Share2 },
  { name: "MonitorSmartphone", label: "Monitor · Website & Mobile", Icon: MonitorSmartphone },
  { name: "FileText", label: "File · Content Marketing", Icon: FileText },
  { name: "Mail", label: "Mail · Email Marketing", Icon: Mail },
  { name: "BarChart3", label: "Bar Chart · Analytics", Icon: BarChart3 },
  { name: "Target", label: "Target · Paid Advertising", Icon: Target },
  { name: "Palette", label: "Palette · Branding", Icon: Palette },
  { name: "PenTool", label: "Pen Tool · Design", Icon: PenTool },
  { name: "Code2", label: "Code · Web Development", Icon: Code2 },
  { name: "ShoppingCart", label: "Shopping Cart · E-commerce", Icon: ShoppingCart },
  { name: "Globe2", label: "Globe · Digital Presence", Icon: Globe2 },
  { name: "TrendingUp", label: "Trending Up · Growth", Icon: TrendingUp },
  { name: "Briefcase", label: "Briefcase · Business Strategy", Icon: Briefcase },
  { name: "Cpu", label: "CPU · AI Automation", Icon: Cpu },
  { name: "Users", label: "Users · Community", Icon: Users },
  { name: "Lightbulb", label: "Lightbulb · Ideas", Icon: Lightbulb },
] as const;

export type ServiceIconName = (typeof SERVICE_ICON_OPTIONS)[number]["name"];
export const DEFAULT_SERVICE_ICON: ServiceIconName = "Megaphone";

type ServiceIconOption = (typeof SERVICE_ICON_OPTIONS)[number];

function findIconOption(value: unknown): ServiceIconOption | undefined {
  if (typeof value !== "string") return undefined;
  return SERVICE_ICON_OPTIONS.find((option) => option.name === value);
}

export function isServiceIconName(value: unknown): value is ServiceIconName {
  return Boolean(findIconOption(value));
}

export function getServiceIconName(
  value: unknown,
  fallback: ServiceIconName = DEFAULT_SERVICE_ICON,
): ServiceIconName {
  const namedIcon = findIconOption(value);
  if (namedIcon) {
    return namedIcon.name;
  }

  // Recognize an in-memory legacy Lucide component before it is serialized.
  // Persisted legacy values such as {} safely use the supplied fallback.
  if (value && typeof value === "object") {
    const legacyMatch = SERVICE_ICON_OPTIONS.find((option) => option.Icon === value);
    if (legacyMatch) {
      return legacyMatch.name;
    }
  }

  return fallback;
}

export function getServiceIcon(value: unknown): LucideIcon {
  const iconName = getServiceIconName(value);
  const option = findIconOption(iconName);
  return option?.Icon ?? SERVICE_ICON_OPTIONS[0].Icon;
}
