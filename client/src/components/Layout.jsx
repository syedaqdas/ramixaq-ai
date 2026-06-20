import {
  Award,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  FileScan,
  FileText,
  Gauge,
  GraduationCap,
  LogOut,
  Map,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/ai/resume-analyzer", label: "AI Resume", icon: FileScan },
  { to: "/ai/skill-gap", label: "Skill Gap", icon: Sparkles },
  { to: "/ai/internships", label: "Internships", icon: GraduationCap },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/skills", label: "Skills", icon: BadgeCheck },
  { to: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/resume", label: "Resume", icon: CheckSquare },
  { to: "/resume-builder", label: "Resume Builder", icon: FileText },
  { to: "/portfolio-generator", label: "Portfolio Site", icon: UserRound },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/profile", label: "Profile", icon: UserRound }
];

const Sidebar = ({ onNavigate }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-line bg-zinc-950/95 p-4">
      <div className="mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan text-lg font-black text-zinc-950">
          RA
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">Ramixaq AI</h1>
        <p className="mt-1 text-sm text-zinc-500">{user?.headline || "Build. Track. Achieve."}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-cyan text-zinc-950" : "text-zinc-300 hover:bg-panelSoft hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-cyan text-zinc-950" : "text-zinc-300 hover:bg-panelSoft hover:text-white"
              }`
            }
          >
            <ShieldCheck size={18} />
            Admin
          </NavLink>
        )}
      </nav>

      <button className="btn-secondary mt-auto justify-start" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
};

const Layout = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-72 max-w-[86vw]">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-line bg-ink/80 backdrop-blur lg:pl-72">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="btn-secondary px-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <span className="font-semibold text-white lg:hidden">Ramixaq AI</span>
          <div className="ml-auto flex gap-2">
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Build. Track. Achieve.</p>
              <p className="text-xl font-semibold text-white">{user?.name}</p>
            </div>
            <p className="hidden text-sm text-zinc-500 sm:block">{user?.email}</p>
          </div>
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-zinc-950/95 px-2 py-2 backdrop-blur lg:hidden">
        {[
          { to: "/dashboard", label: "Home", icon: Gauge },
          { to: "/ai/resume-analyzer", label: "Resume", icon: FileScan },
          { to: "/ai/internships", label: "Matches", icon: GraduationCap },
          { to: "/profile", label: "Profile", icon: UserRound }
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex flex-col items-center gap-1 rounded-md py-1 text-[11px] font-medium ${isActive ? "text-cyan" : "text-zinc-500"}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
