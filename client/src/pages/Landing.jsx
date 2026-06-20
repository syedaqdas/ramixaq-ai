import { ArrowRight, LogIn } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import AboutDeveloper from "../components/AboutDeveloper";
import BrandLogo from "../components/BrandLogo";
import DeveloperCredit from "../components/DeveloperCredit";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-sm text-zinc-400">Loading Ramixaq AI...</main>;
  }

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-line pb-4">
          <Link className="flex items-center gap-3" to="/" aria-label="Ramixaq AI home">
            <BrandLogo size="sm" eager />
            <span className="font-bold text-white">Ramixaq AI</span>
          </Link>
          <ThemeToggle />
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <BrandLogo size="xl" eager />
          <h1 className="mt-7 text-4xl font-bold text-white sm:text-5xl">Ramixaq AI</h1>
          <p className="mt-3 text-lg font-semibold text-cyan">Build. Track. Achieve.</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            An AI-powered career intelligence and internship readiness platform that helps students turn skills,
            projects, and goals into measurable career progress.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link className="btn-primary" to="/register">
              Start building
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" to="/login">
              <LogIn size={18} />
              Login
            </Link>
          </div>
        </section>

        <AboutDeveloper />
        <DeveloperCredit className="py-5" />
      </div>
    </main>
  );
};

export default Landing;
