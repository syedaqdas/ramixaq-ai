import { Sparkles } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import { targetRoles } from "../utils/career";

const SkillGapAnalysis = () => {
  const [targetRole, setTargetRole] = useState(targetRoles[0]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const { data } = await api.post("/ai/skill-gap", { targetRole });
    setAnalysis(data);
    setLoading(false);
  };

  return (
    <div>
      <PageHeader eyebrow="AI Skill Gap Analysis" title="Role readiness map" />

      <section className="card grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
        <label className="space-y-2">
          <span className="label">Target role</span>
          <select className="input" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
            {targetRoles.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <button className="btn-primary self-end" onClick={runAnalysis} disabled={loading}>
          <Sparkles size={18} />
          {loading ? "Analyzing..." : "Analyze gap"}
        </button>
      </section>

      {analysis && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <section className="card p-5">
            <p className="text-sm uppercase tracking-wide text-cyan">Match score</p>
            <p className="mt-2 text-5xl font-bold text-white">{analysis.matchScore}%</p>
            <div className="mt-5 h-3 rounded-full bg-zinc-950">
              <div className="h-3 rounded-full bg-cyan" style={{ width: `${analysis.matchScore}%` }} />
            </div>
            <p className="mt-4 text-sm text-zinc-400">{analysis.matchedSkills.length} of {analysis.requiredSkills.length} required skills matched.</p>
          </section>
          <section className="card p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="label">Matched skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.matchedSkills.map((skill) => <span className="chip border-mint/40 text-green-200" key={skill}>{skill}</span>)}
                </div>
              </div>
              <div>
                <p className="label">Missing skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => <span className="chip border-amber/40 text-amber-100" key={skill}>{skill}</span>)}
                </div>
              </div>
            </div>
          </section>
          <section className="card p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">Learning recommendations</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {analysis.recommendations.map((item) => (
                <div className="rounded-md border border-line bg-zinc-950 p-4" key={item.skill}>
                  <p className="font-semibold text-white">{item.skill}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-cyan">{item.priority} priority</p>
                  <p className="mt-3 text-sm text-zinc-400">{item.action}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;

