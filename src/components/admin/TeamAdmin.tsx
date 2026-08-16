import React, { useEffect, useState } from "react";
import { Check, Edit2, Plus, Trash2, Upload, X } from "lucide-react";
import {
  createTeamMemberViaApi,
  deleteTeamMemberViaApi,
  fetchTeamFromApi,
  getStoredTeamMembers,
  isTeamApiConfigured,
  saveStoredTeamMembers,
  TeamApiError,
  teamApiErrorMessage,
  type TeamRecord,
  updateTeamMemberViaApi,
} from "../../services/teamStore";

const fieldClassName =
  "w-full rounded-xl border border-white/20 bg-[#071B17] px-4 py-3 text-sm text-white placeholder:text-gray-400 shadow-inner outline-none transition focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/30 disabled:cursor-not-allowed disabled:opacity-60";
const labelClassName = "block text-sm font-semibold text-gray-100";
const helpTextClassName = "mt-1.5 text-xs leading-relaxed text-gray-300";
const sectionClassName = "rounded-2xl border border-white/15 bg-[#102C25]/80 p-5 md:p-6 space-y-5";

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className="border-b border-white/15 pb-3">
        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-[#7FF5DE]">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function TeamAdmin() {
  const [members, setMembers] = useState<TeamRecord[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [image, setImage] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fallbackMembers = getStoredTeamMembers();
    setMembers(fallbackMembers);

    if (!isTeamApiConfigured()) {
      return () => {
        isMounted = false;
      };
    }

    fetchTeamFromApi()
      .then((remoteMembers) => {
        if (!isMounted) return;
        if (remoteMembers.length > 0 || fallbackMembers.length === 0) {
          setMembers(remoteMembers);
        } else {
          setApiError("The Team API returned no records. Run the additive CMS migration before editing production data.");
        }
      })
      .catch((error) => {
        if (isMounted) setApiError(teamApiErrorMessage(error));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setImagePreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const existing = isEditing
      ? members.find((member) => member.id === isEditing)
      : undefined;
    const imageValue = image.trim();

    if (isTeamApiConfigured() && imageValue.startsWith("data:")) {
      setApiError("Use an image URL or relative asset path when PHP API mode is enabled. Browser file data is kept only by the local fallback.");
      return;
    }

    const memberPayload: TeamRecord = {
      ...(existing ?? {}),
      id: existing?.id,
      name: name.trim(),
      role: role.trim(),
      image: imageValue,
      linkedin: linkedin.trim() || undefined,
      displayOrder: existing?.displayOrder ?? members.length,
    };

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      if (isTeamApiConfigured()) {
        if (existing) {
          if (!existing.id) {
            throw new TeamApiError(400, "MISSING_TEAM_ID", "This member has no API ID. Reload the Team list before editing it.");
          }
          const updatedMember = await updateTeamMemberViaApi(existing.id, memberPayload, existing.displayOrder);
          setMembers((current) => current.map((member) => member.id === existing.id ? updatedMember : member));
          setSuccessMessage("Team member updated in the PHP API and MySQL.");
        } else {
          const createdMember = await createTeamMemberViaApi(memberPayload, members.length);
          setMembers((current) => [...current, createdMember]);
          setSuccessMessage("Team member created in the PHP API and MySQL.");
        }
      } else {
        const localRecord: TeamRecord = {
          ...memberPayload,
          id: existing?.id ?? Date.now().toString(),
        };
        const updated = existing
          ? members.map((member) => member.id === existing.id ? localRecord : member)
          : [...members, localRecord];
        setMembers(saveStoredTeamMembers(updated));
        setSuccessMessage("Team member saved to the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }
      resetForm();
    } catch (error) {
      setApiError(teamApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: TeamRecord) => {
    setIsEditing(member.id);
    setName(member.name);
    setRole(member.role);
    setImage(member.image || "");
    setLinkedin(member.linkedin || "");
    setImagePreviewError(false);
  };

  const handleDelete = async (member: TeamRecord) => {
    if (!confirm(`Delete "${member.name}" from the public Team section?`)) return;

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);
    try {
      if (isTeamApiConfigured()) {
        if (!member.id) {
          throw new TeamApiError(400, "MISSING_TEAM_ID", "This member has no API ID. Reload the Team list before deleting it.");
        }
        await deleteTeamMemberViaApi(member.id);
        setMembers((current) => current.filter((item) => item.id !== member.id));
        setSuccessMessage("Team member deleted from the PHP API and MySQL.");
      } else {
        setMembers(saveStoredTeamMembers(members.filter((item) => item.id !== member.id)));
        setSuccessMessage("Team member deleted from the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }

      if (isEditing === member.id) resetForm();
    } catch (error) {
      setApiError(teamApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setName("");
    setRole("");
    setImage("");
    setLinkedin("");
    setImagePreviewError(false);
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleAddOrUpdate}
        className="space-y-6 rounded-2xl border border-white/15 bg-[#0B241F] p-5 text-white shadow-xl md:p-7"
      >
        <div className="flex flex-col gap-3 border-b border-white/15 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white md:text-2xl">
              {isEditing ? "Edit Team Member" : "Add New Team Member"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-300">
              Add clear profile information for the public Team card. New members are added after the existing team.
            </p>
            <p className="mt-2 text-xs text-gray-300">
              Fields marked <span className="font-bold text-[#7FF5DE]">*</span> are required.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#2DD4BF]/30 bg-[#123832] px-3 py-1 text-xs font-semibold text-[#7FF5DE]">
            {isEditing ? "Editing existing member" : "New member"}
          </span>
        </div>

        {apiError && (
          <p role="alert" className="rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
            {apiError}
          </p>
        )}
        {successMessage && (
          <p role="status" className="rounded-xl border border-emerald-300/30 bg-emerald-950/30 px-4 py-3 text-sm font-medium text-emerald-200">
            {successMessage}
          </p>
        )}

        <FormSection
          title="Team Member Basic Information"
          description="These details appear directly on the public Team member card."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="team-member-name" className={labelClassName}>
                Full Name <span className="text-[#7FF5DE]" aria-hidden="true">*</span>
              </label>
              <p className={helpTextClassName}>Displayed as the main name on the public Team card.</p>
              <input
                id="team-member-name"
                type="text"
                placeholder="e.g. Ayesha Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${fieldClassName} mt-2`}
                required
              />
            </div>

            <div>
              <label htmlFor="team-member-role" className={labelClassName}>
                Professional Role / Designation <span className="text-[#7FF5DE]" aria-hidden="true">*</span>
              </label>
              <p className={helpTextClassName}>Displayed below the member's name on the public Team card.</p>
              <input
                id="team-member-role"
                type="text"
                placeholder="e.g. SEO Specialist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${fieldClassName} mt-2`}
                required
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Profile Image"
          description="Use the existing upload mechanism or provide an image URL. The image is displayed as a circular profile photo."
        >
          <div>
            <label htmlFor="team-member-image" className={labelClassName}>Image URL or Uploaded Image</label>
            <p className={helpTextClassName}>
              Paste an image URL or upload a square/portrait image. Uploaded files are stored as a serializable data URL in the current browser.
            </p>
            <input
              id="team-member-image"
              type="text"
              placeholder="https://example.com/team-member.jpg"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                setImagePreviewError(false);
              }}
              className={`${fieldClassName} mt-2`}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-white/20 focus-within:ring-2 focus-within:ring-[#7FF5DE]">
              <Upload size={16} /> Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
            </label>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#2DD4BF]/50 bg-[#123832]">
                {image && !imagePreviewError ? (
                  <img
                    src={image}
                    alt="Team member preview"
                    onError={() => setImagePreviewError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-1 text-center text-[10px] text-gray-400">
                    {image ? "Preview unavailable" : "No image"}
                  </span>
                )}
              </div>
              <span>Preview of the profile image shown on the public card.</span>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Social / Contact Information"
          description="These links control the social action attached to the member's public profile image."
        >
          <div>
            <label htmlFor="team-member-linkedin" className={labelClassName}>LinkedIn Profile URL</label>
            <p className={helpTextClassName}>Optional. Used for the LinkedIn link when visitors click the profile image.</p>
            <input
              id="team-member-linkedin"
              type="url"
              placeholder="https://www.linkedin.com/in/your-profile"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className={`${fieldClassName} mt-2`}
            />
          </div>
        </FormSection>

        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
          <span className="font-semibold text-gray-100">Display order:</span> the list below matches the public Team section order. New members are appended to the end.
        </div>

        <div className="flex flex-wrap gap-3 border-t border-white/15 pt-5">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#14B8A6]/10 transition-all hover:bg-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#7FF5DE] focus:ring-offset-2 focus:ring-offset-[#0B241F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditing ? <Check size={16} /> : <Plus size={16} />}
            {isSaving ? "Saving..." : isEditing ? "Update Member" : "Add Member"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-gray-100 transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-secondary">Current Team Members</h3>
          <p className="mt-1 text-sm text-gray-600">Edit or remove a member while keeping the same public Team card design.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#102C25] p-4">
              <div className="flex min-w-0 items-center gap-3">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-white">{member.name}</h4>
                  <p className="truncate text-xs text-[#7FF5DE]">{member.role}</p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(member)}
                  aria-label={`Edit ${member.name}`}
                  className="rounded-lg p-2 text-gray-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7FF5DE]"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(member)}
                  aria-label={`Delete ${member.name}`}
                  className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
