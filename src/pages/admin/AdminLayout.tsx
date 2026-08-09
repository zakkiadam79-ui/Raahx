import { useEffect, useState } from "react";
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
import SecretAdminLogin from "../SecretAdminLogin";

type AuthState = "checking" | "authenticated" | "unauthenticated";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("checking");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Session check failed");
        }

        const data = (await response.json()) as { authenticated?: boolean };
        setAuthState(data.authenticated === true ? "authenticated" : "unauthenticated");
      } catch {
        if (!controller.signal.aborted) {
          setAuthState("unauthenticated");
        }
      }
    };

    void checkSession();

    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Clear the local UI state even if the network request fails.
    } finally {
      setAuthState("unauthenticated");
      setSidebarOpen(false);
      navigate("/admin", { replace: true });
    }
  };

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking admin session...</p>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <SecretAdminLogin onLoginSuccess={() => setAuthState("authenticated")} />;
  }

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
            onClick={() => void handleLogout()}
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
            <Route path="/" element={<AdminDashboard onLogout={() => void handleLogout()} />} />
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
