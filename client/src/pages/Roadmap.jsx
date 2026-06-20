import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import { targetRoles } from "../utils/career";

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState(targetRoles[0]);
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api
      .get("/roadmap")
      .then(({ data }) => setRoadmap(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading roadmap...</p>;

  const generateRoadmap = async () => {
    setGenerating(true);
    const { data } = await api.post("/ai/skill-gap", { targetRole });
    setAiRoadmap(data);
    setGenerating(false);
  };

  return (
    <div>
      <PageHeader eyebrow="Skill planning" title="Roadmap">
        <Link className="btn-secondary" to="/skills">
          <Plus size={18} />
          Add skill
        </Link>
      </PageHeader>

      <section className="card mb-4 grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
        <label className="space-y-2">
          <span className="label">Generate roadmap for</span>
          <select className="input" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
            {targetRoles.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <button className="btn-primary self-end" onClick={generateRoadmap} disabled={generating}>
          <Sparkles size={18} />
          {generating ? "Generating..." : "Generate AI roadmap"}
        </button>
      </section>

      {aiRoadmap && (
        <section className="card mb-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan">Personalized plan</p>
              <h2 className="mt-1 text-xl font-bold text-white">{aiRoadmap.targetRole}</h2>
            </div>
            <p className="text-3xl font-bold text-white">{aiRoadmap.matchScore}%</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {aiRoadmap.recommendations.map((item, index) => (
              <div className="rounded-md border border-line bg-zinc-950 p-4" key={item.skill}>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan">Step {index + 1} - {item.priority}</p>
                <p className="mt-2 font-semibold text-white">{item.skill}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.action}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card p-5">
        <p className="text-sm uppercase tracking-wide text-cyan">Recommended track</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{roadmap?.recommendedTrack?.role}</h2>
        <div className="mt-4 h-3 rounded-full bg-zinc-950">
          <div className="h-3 rounded-full bg-cyan" style={{ width: `${roadmap?.recommendedTrack?.match || 0}%` }} />
        </div>
        <p className="mt-2 text-sm text-zinc-400">{roadmap?.recommendedTrack?.match || 0}% skill match</p>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {roadmap?.tracks?.map((track) => (
          <section className="card p-5" key={track.role}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{track.role}</h3>
                <p className="mt-1 text-sm text-zinc-500">{track.match}% match</p>
              </div>
              <ArrowRight className="text-cyan" size={20} />
            </div>
            <div className="mt-4">
              <p className="label">Next skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {track.nextSkills.length ? (
                  track.nextSkills.map((skill) => <span className="chip" key={skill}>{skill}</span>)
                ) : (
                  <span className="chip border-mint/40 text-green-200">Track covered</span>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
