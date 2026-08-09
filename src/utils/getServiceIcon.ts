// src/utils/getServiceIcon.ts
import {
  Megaphone,
  Search,
  PenTool,
  MonitorSmartphone,
  Share2,
  Palette,
  Target,
  Cpu,
  Briefcase,
  Code2,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Megaphone,
  Search,
  PenTool,
  MonitorSmartphone,
  Share2,
  Palette,
  Target,
  Cpu,
  Briefcase,
  Code2,
};

export function getServiceIcon(iconName: any): LucideIcon {
  if (typeof iconName !== "string") return iconName || Megaphone;
  return iconMap[iconName] || Megaphone;
}