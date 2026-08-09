// src/pages/AdminDashboard.tsx
import React, { useState } from "react";
import { Users, Briefcase, FileText, BookOpen, LogOut } from "lucide-react";

interface Props {
  onLogout: () => void;
}

type Tab = "team" | "services" | "case-studies" | "blogs";

export default function AdminDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("team");

  return (
    <div className="min-h-screen bg-[#0D2B24] text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#081B17] border-r border-white/10 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 rounded-full bg-[#2DD4BF] animate-pulse" />
            <h2 className="font-bold text-lg tracking-wide text-white">RaahX Portal</h2>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "team" ? "bg-[#14B8A6] text-white" : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <Users size={18} /> Team Members
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "services" ? "bg-[#14B8A6] text-white" : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <Briefcase size={18} /> Services
            </button>

            <button
              onClick={() => setActiveTab("case-studies")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "case-studies" ? "bg-[#14B8A6] text-white" : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <FileText size={18} /> Case Studies
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "blogs" ? "bg-[#14B8A6] text-white" : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <BookOpen size={18} /> Blogs
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-8"
        >
          <LogOut size={18} /> Exit Portal
        </button>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-10">
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold capitalize">{activeTab.replace("-", " ")} Management</h1>
          <p className="text-sm text-gray-400">Add, edit, or remove items from your public site.</p>
        </header>

        {/* Dynamic Module Placeholder */}
        <div className="bg-[#123832] border border-white/10 rounded-2xl p-6">
          {activeTab === "team" && <div>[Team Module Coming Next]</div>}
          {activeTab === "services" && <div>[Services Module Placeholder]</div>}
          {activeTab === "case-studies" && <div>[Case Studies Module Placeholder]</div>}
          {activeTab === "blogs" && <div>[Blogs Module Placeholder]</div>}
        </div>
      </main>
    </div>
  );
}