import { FileScan, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { targetRoles } from "../utils/career";

const AIResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(targetRoles[0]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/ai/resume/analyses").then(({ data }) => setHistory(data)).catch(() => {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Upload a PDF resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/ai/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(data);
      setHistory([data.analysis, ...history]);
    } catch (err) {
      setError(err.response?.data?.message || "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;

  return (
    <div>
      <PageHeader eyebrow="AI Resume Analyzer" title="Resume intelligence" />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="card space-y-4 p-5" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="label">Target role</span>
            <select className="input" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
              {targetRoles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </label>
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-zinc-950 p-6 text-center transition hover:border-cyan">
            <UploadCloud className="text-cyan" size={32} />
            <span className="mt-3 text-sm font-semibold text-white">{file?.name || "Upload PDF resume"}</span>
            <span className="mt-1 text-xs text-zinc-500">PDF only, max 5 MB</span>
            <input className="hidden" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            <FileScan size={18} />
            {loading ? "Analyzing..." : "Analyze resume"}
          </button>
        </form>

        <section className="card p-5">
          {analysis ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-cyan">ATS score</p>
                  <p className="mt-2 text-5xl font-bold text-white">{analysis.atsScore}</p>
                </div>
                <StatusBadge value={analysis.atsScore >= 75 ? "Completed" : analysis.atsScore >= 55 ? "In Progress" : "High"} />
              </div>
              <div className="mt-5 h-3 rounded-full bg-zinc-950">
                <div className="h-3 rounded-full bg-cyan" style={{ width: `${analysis.atsScore}%` }} />
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="label">Extracted skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.extractedSkills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}
                  </div>
                </div>
                <div>
                  <p className="label">Missing skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.missingSkills.map((skill) => <span className="chip border-amber/40 text-amber-100" key={skill}>{skill}</span>)}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="label">AI recommendations</p>
                <div className="mt-3 space-y-2">
                  {analysis.suggestions.map((suggestion) => (
                    <p className="rounded-md border border-line bg-zinc-950 p-3 text-sm text-zinc-300" key={suggestion}>{suggestion}</p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center text-center text-zinc-500">
              <div>
                <FileScan className="mx-auto text-cyan" size={38} />
                <p className="mt-3 text-sm">Upload a resume to extract skills, calculate ATS score, and detect missing role skills.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="mt-5 card p-5">
        <h2 className="text-lg font-semibold text-white">Recent analyses</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {history.map((item) => (
            <div className="rounded-md border border-line bg-zinc-950 p-4" key={item._id}>
              <p className="font-medium text-white">{item.fileName}</p>
              <p className="mt-1 text-sm text-zinc-500">{item.targetRole}</p>
              <p className="mt-3 text-2xl font-bold text-cyan">{item.atsScore}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AIResumeAnalyzer;

