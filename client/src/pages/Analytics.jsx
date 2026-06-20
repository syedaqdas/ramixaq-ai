import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Legend,
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
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#22d3ee", "#22c55e", "#f59e0b", "#ef4444"];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setAnalytics(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading analytics...</p>;
  const gridColor = theme === "light" ? "#d4d4d8" : "#27272a";
  const axisColor = theme === "light" ? "#52525b" : "#a1a1aa";
  const tooltipStyle = {
    background: theme === "light" ? "#ffffff" : "#111113",
    border: `1px solid ${gridColor}`,
    color: theme === "light" ? "#18181b" : "#f4f4f5"
  };

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
                <CartesianGrid stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip contentStyle={tooltipStyle} />
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
                <CartesianGrid stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} />
                <YAxis stroke={axisColor} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
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
                <CartesianGrid stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip contentStyle={tooltipStyle} />
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
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold text-white">Resume ATS progress</h2>
          <div className="mt-4 h-72">
            {analytics.resumeScores.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.resumeScores}>
                  <defs>
                    <linearGradient id="atsScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} />
                  <XAxis dataKey="date" stroke={axisColor} />
                  <YAxis stroke={axisColor} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="atsScore" stroke="#22d3ee" fill="url(#atsScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-zinc-500">Analyze a resume to start tracking ATS progress.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
