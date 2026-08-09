import {
  Briefcase,
  Code2,
  Cpu,
  Megaphone,
  MonitorSmartphone,
  Palette,
  PenTool,
  Search,
  Share2,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap = {
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
} as const;

export type ServiceIconName = keyof typeof iconMap;
export const DEFAULT_SERVICE_ICON: ServiceIconName = "Megaphone";
export const SERVICE_ICON_OPTIONS = Object.keys(iconMap) as ServiceIconName[];

export function isServiceIconName(value: unknown): value is ServiceIconName {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(iconMap, value);
}

export function getServiceIconName(
  value: unknown,
  fallback: ServiceIconName = DEFAULT_SERVICE_ICON,
): ServiceIconName {
  if (isServiceIconName(value)) {
    return value;
  }

  // This also recognizes an in-memory legacy Lucide component before it is
  // serialized. Persisted legacy values such as {} are handled by fallback.
  if (value && typeof value === "object") {
    const legacyMatch = Object.entries(iconMap).find(([, Icon]) => Icon === value);
    if (legacyMatch) {
      return legacyMatch[0] as ServiceIconName;
    }
  }

  return fallback;
}

export function getServiceIcon(value: unknown): LucideIcon {
  const iconName = getServiceIconName(value);
  return iconMap[iconName] ?? iconMap[DEFAULT_SERVICE_ICON];
}
