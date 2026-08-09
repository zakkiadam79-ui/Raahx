import { defaultTeamMembers, type TeamMember } from "../data/teamData";
import { isServiceApiConfigured, serviceApiUrl } from "./serviceStore";

export const TEAM_STORAGE_KEY = "raahx_team_data";

export type TeamRecord = TeamMember & {
  displayOrder?: number;
};

export class TeamApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "TeamApiError";
  }
}
const TEAM_MIGRATION_KEY = "raahx_team_data_v2_migrated";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneDefaultTeamMembers(): TeamRecord[] {
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

function normalizeTeamMember(value: unknown, index: number, usedIds: Set<string>): TeamRecord | null {
  if (!isRecord(value)) return null;

  const hasTeamFields = ["name", "role", "image", "linkedin"].some((field) => field in value);
  if (!hasTeamFields) return null;

  const name = typeof value.name === "string" && value.name.trim() ? value.name.trim() : "Team Member";
  const role = typeof value.role === "string" && value.role.trim() ? value.role.trim() : "RaahX Team";
  const image = typeof value.image === "string" ? value.image.trim() : "";
  const linkedin = typeof value.linkedin === "string" ? value.linkedin.trim() : "";

  const displayOrder = typeof value.displayOrder === "number"
    ? value.displayOrder
    : typeof value.display_order === "number"
    ? value.display_order
    : undefined;

  return {
    ...value,
    id: getUniqueId(value.id, name, index, usedIds),
    name,
    role,
    image,
    linkedin: linkedin || undefined,
    displayOrder,
  } as TeamRecord;
}

export function normalizeTeamMembers(value: unknown): TeamRecord[] {
  if (!Array.isArray(value)) {
    return cloneDefaultTeamMembers();
  }

  const usedIds = new Set<string>();
  const normalized = value
    .map((member, index) => normalizeTeamMember(member, index, usedIds))
    .filter((member): member is TeamRecord => member !== null);

  return value.length > 0 && normalized.length === 0 ? cloneDefaultTeamMembers() : normalized;
}

function matchesDefaultMember(member: TeamRecord, defaultMember: TeamMember): boolean {
  return member.id === defaultMember.id || (
    member.name === defaultMember.name && member.role === defaultMember.role
  );
}

function mergeLegacyDefaults(members: TeamRecord[]): TeamRecord[] {
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

export function getStoredTeamMembers(options: { persist?: boolean } = {}): TeamRecord[] {
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

export function saveStoredTeamMembers(members: TeamRecord[]): TeamRecord[] {
  const normalized = normalizeTeamMembers(members);

  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(TEAM_MIGRATION_KEY, "true");
  } catch {
    // Keep the admin UI usable if browser storage is unavailable.
  }

  return normalized;
}

function teamApiErrorMessage(error: unknown): string {
  if (error instanceof TeamApiError) {
    if (error.status === 401 || error.status === 403) return "The PHP API session is not authenticated. Sign in again before changing Team data.";
    return error.message;
  }
  return "The Team API is unavailable.";
}

async function teamApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(serviceApiUrl(path), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new TeamApiError(0, "NETWORK_ERROR", "The Team API could not be reached.");
  }

  const payload = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok || !payload?.success) {
    throw new TeamApiError(
      response.status,
      payload?.error?.code ?? "API_ERROR",
      payload?.error?.message ?? "The Team API returned an error.",
    );
  }

  return payload.data as T;
}

function apiTeamToRecord(value: unknown): TeamRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  return normalizeTeamMember({
    ...raw,
    id: raw.id,
    name: raw.name,
    role: raw.role,
    image: raw.image_url ?? raw.image ?? "",
    linkedin: raw.linkedin_url ?? raw.linkedin ?? undefined,
    displayOrder: raw.display_order ?? raw.displayOrder,
  }, 0, new Set<string>());
}

function teamRecordToApiPayload(member: TeamRecord, displayOrder?: number): Record<string, unknown> {
  return {
    ...(member.id ? { id: member.id } : {}),
    name: member.name,
    role: member.role,
    image_url: member.image,
    linkedin_url: member.linkedin ?? null,
    display_order: displayOrder ?? member.displayOrder ?? 0,
  };
}

export async function fetchTeamFromApi(): Promise<TeamRecord[]> {
  const data = await teamApiRequest<unknown[]>("/team");
  if (!Array.isArray(data)) {
    throw new TeamApiError(502, "INVALID_API_RESPONSE", "The Team API returned invalid data.");
  }

  return data
    .map(apiTeamToRecord)
    .filter((member): member is TeamRecord => member !== null)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function createTeamMemberViaApi(member: TeamRecord, displayOrder?: number): Promise<TeamRecord> {
  const data = await teamApiRequest<unknown>("/team", {
    method: "POST",
    body: JSON.stringify(teamRecordToApiPayload(member, displayOrder)),
  });
  const record = apiTeamToRecord(data);
  if (!record) throw new TeamApiError(502, "INVALID_API_RESPONSE", "The Team API returned an invalid member.");
  return record;
}

export async function updateTeamMemberViaApi(id: string, member: TeamRecord, displayOrder?: number): Promise<TeamRecord> {
  const data = await teamApiRequest<unknown>(`/team/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(teamRecordToApiPayload({ ...member, id }, displayOrder)),
  });
  const record = apiTeamToRecord(data);
  if (!record) throw new TeamApiError(502, "INVALID_API_RESPONSE", "The Team API returned an invalid member.");
  return record;
}

export async function deleteTeamMemberViaApi(id: string): Promise<void> {
  await teamApiRequest<{ deleted: boolean }>(`/team/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export const isTeamApiConfigured = isServiceApiConfigured;
export { teamApiErrorMessage };
