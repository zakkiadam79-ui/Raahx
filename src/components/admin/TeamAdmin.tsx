import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Upload } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
}

const STORAGE_KEY = "raahx_team_data";

export default function TeamAdmin() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [image, setImage] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMembers(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (updated: TeamMember[]) => {
    setMembers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    if (isEditing) {
      const updated = members.map((m) =>
        m.id === isEditing ? { ...m, name, role, image, linkedin } : m
      );
      saveToStorage(updated);
      setIsEditing(null);
    } else {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name,
        role,
        image,
        linkedin,
      };
      saveToStorage([...members, newMember]);
    }

    // Reset Form
    setName("");
    setRole("");
    setImage("");
    setLinkedin("");
  };

  const handleEdit = (member: TeamMember) => {
    setIsEditing(member.id);
    setName(member.name);
    setRole(member.role);
    setImage(member.image || "");
    setLinkedin(member.linkedin || "");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this team member?")) {
      const updated = members.filter((m) => m.id !== id);
      saveToStorage(updated);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setName("");
    setRole("");
    setImage("");
    setLinkedin("");
  };

  return (
    <div className="space-y-8">
      {/* Add / Edit Form */}
      <form onSubmit={handleAddOrUpdate} className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">
          {isEditing ? "Edit Team Member" : "Add New Team Member"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name (e.g. M Qasim)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2DD4BF]"
            required
          />

          <input
            type="text"
            placeholder="Role (e.g. CEO & Founder)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2DD4BF]"
            required
          />

          <input
            type="url"
            placeholder="LinkedIn Profile URL (Optional)"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2DD4BF] md:col-span-2"
          />
        </div>

        {/* Image Upload Input */}
        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-sm text-gray-300 transition-all">
            <Upload size={16} /> Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {image && (
            <img src={image} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-[#2DD4BF]" />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold rounded-xl transition-all text-sm"
          >
            {isEditing ? <Check size={16} /> : <Plus size={16} />}
            {isEditing ? "Update Member" : "Add Member"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl transition-all text-sm"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Members List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="p-4 bg-black/20 border border-white/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-semibold text-white text-sm">{member.name}</h4>
                <p className="text-xs text-[#2DD4BF]">{member.role}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(member)} className="p-2 hover:bg-white/10 text-gray-300 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}