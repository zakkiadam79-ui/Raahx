import { useState } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { 
  FileText, Briefcase, Users, FolderKanban, LogOut, LayoutDashboard, Menu, X 
} from "lucide-react";

// Importing components directly from your existing file structure
import CaseStudiesAdmin from "../../components/admin/CaseStudiesAdmin";
import ServicesAdmin from "../../components/admin/ServicesAdmin";
import TeamAdmin from "../../components/admin/TeamAdmin";
import AdminBlog from "../AdminBlog";
import AdminDashboard from "../AdminDashboard";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Blogs", path: "/admin/blogs", icon: FileText },
    { label: "Services", path: "/admin/services", icon: Briefcase },
    { label: "Case Studies", path: "/admin/case-studies", icon: FolderKanban },
    { label: "Team", path: "/admin/team", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-body">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-white">
            RaahX <span className="text-xs text-gray-400 font-normal">Admin</span>
          </Link>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-white" : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => navigate("/")} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="text-sm text-gray-500 font-medium">Control Panel</div>
          <Link to="/" className="text-xs font-semibold text-primary hover:underline">
            View Live Site →
          </Link>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/blogs" element={<AdminBlog />} />
            <Route path="/services" element={<ServicesAdmin />} />
            <Route path="/case-studies" element={<CaseStudiesAdmin />} />
            <Route path="/team" element={<TeamAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}