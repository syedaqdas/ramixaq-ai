import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useTheme } from "../context/ThemeContext";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    api.get("/admin/summary")
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load admin dashboard."));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="Admin Dashboard" title="Platform monitoring" />
        <div className="card p-5 text-sm text-zinc-400">{error}</div>
      </div>
    );
  }

  if (!summary) return <p className="text-zinc-400">Loading admin dashboard...</p>;

  const gridColor = theme === "light" ? "#d4d4d8" : "#27272a";
  const axisColor = theme === "light" ? "#52525b" : "#a1a1aa";
  const tooltipStyle = {
    background: theme === "light" ? "#ffffff" : "#111113",
    border: `1px solid ${gridColor}`
  };

  return (
    <div>
      <PageHeader eyebrow="Admin Dashboard" title="Platform monitoring" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Users" value={summary.totals.users} />
        <StatCard icon={ShieldCheck} label="Verified users" value={summary.totals.verifiedUsers} accent="text-mint" />
        <StatCard icon={ShieldCheck} label="Resume scans" value={summary.totals.resumeAnalyses} accent="text-amber" />
        <StatCard icon={ShieldCheck} label="Activities" value={summary.totals.activities} accent="text-red-300" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">User growth</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.userGrowth}>
                <CartesianGrid stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} />
                <YAxis stroke={axisColor} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="users" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Platform activity</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.activityBreakdown} layout="vertical">
                <CartesianGrid stroke={gridColor} />
                <XAxis type="number" stroke={axisColor} allowDecimals={false} />
                <YAxis type="category" dataKey="type" stroke={axisColor} width={105} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Recent users</h2>
          <div className="mt-4 space-y-3">
            {summary.recentUsers.map((user) => (
              <div className="rounded-md border border-line bg-zinc-950 p-3" key={user._id}>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-sm text-zinc-500">{user.email} - {user.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-white">Activity monitoring</h2>
          <div className="mt-4 space-y-3">
            {summary.recentActivity.map((activity) => (
              <div className="rounded-md border border-line bg-zinc-950 p-3" key={activity._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{activity.message}</p>
                    <p className="text-sm text-zinc-500">{activity.user?.name || "System"} - {activity.type}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{new Date(activity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
