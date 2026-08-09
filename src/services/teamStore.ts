import { defaultTeamMembers, type TeamMember } from "../data/teamData";

export const TEAM_STORAGE_KEY = "raahx_team_data";
const TEAM_MIGRATION_KEY = "raahx_team_data_v2_migrated";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneDefaultTeamMembers(): TeamMember[] {
  return defaultTeamMembers.map((member) => ({ ...member }));
}

function makeIdSeed(value: string, index: number): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `team-member-${index + 1}`;
}

function getUniqueId(value: unknown, name: string, index: number, usedIds: Set<string>): string {
  const requestedId = typeof value === "string" ? value.trim() : "";
  const seed = requestedId || makeIdSeed(name, index);
  let id = seed;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${seed}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

function normalizeTeamMember(value: unknown, index: number, usedIds: Set<string>): TeamMember | null {
  if (!isRecord(value)) return null;

  const hasTeamFields = ["name", "role", "image", "linkedin"].some((field) => field in value);
  if (!hasTeamFields) return null;

  const name = typeof value.name === "string" && value.name.trim() ? value.name.trim() : "Team Member";
  const role = typeof value.role === "string" && value.role.trim() ? value.role.trim() : "RaahX Team";
  const image = typeof value.image === "string" ? value.image.trim() : "";
  const linkedin = typeof value.linkedin === "string" ? value.linkedin.trim() : "";

  return {
    ...value,
    id: getUniqueId(value.id, name, index, usedIds),
    name,
    role,
    image,
    linkedin: linkedin || undefined,
  } as TeamMember;
}

export function normalizeTeamMembers(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) {
    return cloneDefaultTeamMembers();
  }

  const usedIds = new Set<string>();
  const normalized = value
    .map((member, index) => normalizeTeamMember(member, index, usedIds))
    .filter((member): member is TeamMember => member !== null);

  return value.length > 0 && normalized.length === 0 ? cloneDefaultTeamMembers() : normalized;
}

function matchesDefaultMember(member: TeamMember, defaultMember: TeamMember): boolean {
  return member.id === defaultMember.id || (
    member.name === defaultMember.name && member.role === defaultMember.role
  );
}

function mergeLegacyDefaults(members: TeamMember[]): TeamMember[] {
  const remaining = [...members];
  const merged = defaultTeamMembers.map((defaultMember) => {
    const existingIndex = remaining.findIndex((member) => matchesDefaultMember(member, defaultMember));
    if (existingIndex === -1) return { ...defaultMember };

    const [existing] = remaining.splice(existingIndex, 1);
    return existing;
  });

  // New or custom members retain their stored order after the original team.
  return [...merged, ...remaining];
}

export function getStoredTeamMembers(options: { persist?: boolean } = {}): TeamMember[] {
  const persist = options.persist !== false;

  try {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!saved) {
      return cloneDefaultTeamMembers();
    }

    const parsed: unknown = JSON.parse(saved);
    let normalized = normalizeTeamMembers(parsed);
    const migrationComplete = localStorage.getItem(TEAM_MIGRATION_KEY) === "true";

    // Older admin data could contain only newly added members. Merge the
    // original public team once so those existing members are not lost.
    if (!migrationComplete) {
      normalized = mergeLegacyDefaults(normalized);
      if (persist) {
        localStorage.setItem(TEAM_MIGRATION_KEY, "true");
      }
    }

    const normalizedJson = JSON.stringify(normalized);
    if (persist && normalizedJson !== saved) {
      localStorage.setItem(TEAM_STORAGE_KEY, normalizedJson);
    }

    return normalized;
  } catch {
    // Invalid JSON or unavailable storage must never blank the public website.
    return cloneDefaultTeamMembers();
  }
}

export function saveStoredTeamMembers(members: TeamMember[]): TeamMember[] {
  const normalized = normalizeTeamMembers(members);

  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(TEAM_MIGRATION_KEY, "true");
  } catch {
    // Keep the admin UI usable if browser storage is unavailable.
  }

  return normalized;
}
