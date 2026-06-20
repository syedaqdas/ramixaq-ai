import { Award, BadgeCheck, BriefcaseBusiness, ExternalLink, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import ReadinessMeter from "../components/ReadinessMeter";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

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
