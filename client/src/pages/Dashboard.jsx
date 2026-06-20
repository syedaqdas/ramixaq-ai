import { Award, BadgeCheck, BriefcaseBusiness, Code2, ExternalLink, Github, Globe, Linkedin, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import BrandLogo from "../components/BrandLogo";
import PageHeader from "../components/PageHeader";
import ReadinessMeter from "../components/ReadinessMeter";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { externalUrl } from "../utils/format";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data } = await api.get("/dashboard/summary");
      setSummary(data);
      setLoading(false);
    };

    fetchSummary().catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading dashboard...</p>;

  const portfolioPath = user?.publicSlug ? `/p/${user.publicSlug}` : `/portfolio/${user?.id}`;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4 border-b border-line pb-5">
        <BrandLogo size="md" eager />
        <div>
          <p className="text-lg font-bold text-white">Ramixaq AI</p>
          <p className="mt-1 text-sm text-zinc-500">Build. Track. Achieve.</p>
        </div>
      </div>

      <PageHeader eyebrow="Career dashboard" title="Internship readiness">
        <Link className="btn-secondary" to={portfolioPath}>
          <ExternalLink size={18} />
          Public portfolio
        </Link>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <ReadinessMeter score={summary?.score || 0} />
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-white">Focus areas</h2>
          <div className="mt-4 space-y-3">
            {(summary?.gaps?.length ? summary.gaps : ["Keep updating your career profile"]).map((gap) => (
              <div key={gap} className="rounded-md border border-line bg-zinc-950 p-3 text-sm text-zinc-300">
                {gap}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="card mt-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Profile integrations</h2>
            <p className="mt-1 text-sm text-zinc-500">Public links strengthen recruiter trust and internship matching.</p>
          </div>
          <Link className="btn-secondary" to="/profile/integrations">Manage links</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            ["GitHub", user?.github, Github],
            ["LinkedIn", user?.linkedin, Linkedin],
            ["LeetCode", user?.leetcode, Code2],
            ["Portfolio", user?.portfolio || user?.website, Globe]
          ].map(([label, href, Icon]) =>
            href ? (
              <a className="btn-secondary" href={externalUrl(href)} target="_blank" rel="noreferrer" key={label}>
                <Icon size={17} />
                {label}
              </a>
            ) : (
              <Link className="btn-secondary opacity-60" to="/profile/integrations" key={label}>
                <Icon size={17} />
                Add {label}
              </Link>
            )
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BadgeCheck} label="Skills" value={summary?.counts?.skills || 0} />
        <StatCard icon={BriefcaseBusiness} label="Projects" value={summary?.counts?.projects || 0} accent="text-mint" />
        <StatCard icon={Award} label="Certificates" value={summary?.counts?.certificates || 0} accent="text-amber" />
        <StatCard icon={Target} label="Goals" value={summary?.counts?.goals || 0} accent="text-red-300" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Recent projects</h2>
          <div className="mt-4 space-y-3">
            {summary?.recent?.projects?.length ? (
              summary.recent.projects.map((project) => (
                <div key={project._id} className="rounded-md border border-line bg-zinc-950 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{project.title}</p>
                    <StatusBadge value={project.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{project.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No projects yet.</p>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Active goals</h2>
          <div className="mt-4 space-y-3">
            {summary?.recent?.goals?.length ? (
              summary.recent.goals.map((goal) => (
                <div key={goal._id} className="rounded-md border border-line bg-zinc-950 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{goal.title}</p>
                    <StatusBadge value={goal.status} />
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-panelSoft">
                    <div className="h-2 rounded-full bg-cyan" style={{ width: `${goal.progress || 0}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No internship goals yet.</p>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Strengths</h2>
          <div className="mt-4 space-y-3">
            {(summary?.strengths?.length ? summary.strengths : ["Start by adding your first skill"]).map((strength) => (
              <div key={strength} className="rounded-md border border-mint/30 bg-mint/10 p-3 text-sm text-green-100">
                {strength}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
