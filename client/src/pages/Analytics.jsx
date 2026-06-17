import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

const COLORS = ["#22d3ee", "#22c55e", "#f59e0b", "#ef4444"];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setAnalytics(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading analytics...</p>;

  return (
    <div>
      <PageHeader eyebrow="Analytics Dashboard" title="Career intelligence trends" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BarChart3} label="Skills" value={analytics.totals.skills} />
        <StatCard icon={BarChart3} label="Projects" value={analytics.totals.projects} accent="text-mint" />
        <StatCard icon={BarChart3} label="Completed" value={analytics.totals.completedProjects} accent="text-amber" />
        <StatCard icon={BarChart3} label="Resume scans" value={analytics.totals.resumeAnalyses} accent="text-red-300" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Skill growth</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.skillGrowth}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ background: "#111113", border: "1px solid #27272a" }} />
                <Line type="monotone" dataKey="skills" stroke="#22d3ee" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Readiness trend</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.readinessTrend}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#111113", border: "1px solid #27272a" }} />
                <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Project completion</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.projectCompletion}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ background: "#111113", border: "1px solid #27272a" }} />
                <Bar dataKey="completed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Project status</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.projectStatus} dataKey="count" nameKey="status" outerRadius={92} label>
                  {analytics.projectStatus.map((entry, index) => <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111113", border: "1px solid #27272a" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;

