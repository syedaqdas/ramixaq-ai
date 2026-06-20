import { CheckCircle2, FileUp } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { targetRoles } from "../utils/career";

const sections = [
  ["education", "Education"],
  ["projects", "Projects"],
  ["experience", "Experience"],
  ["certifications", "Certifications"]
];

const ResumeUpload = () => {
  const { setSessionUser } = useAuth();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(targetRoles[0]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return setError("Choose a PDF resume first.");
    if (file.type !== "application/pdf") return setError("Only PDF resumes are supported.");
    if (file.size > 5 * 1024 * 1024) return setError("Resume PDFs must be 5 MB or smaller.");

    const body = new FormData();
    body.append("resume", file);
    body.append("targetRole", targetRole);
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/resume/upload", body);
      setResult(data);
      setSessionUser(data.user);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not parse this resume."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Resume auto-fill" title="Import your career profile" />
      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <form className="card space-y-4 p-5" onSubmit={upload}>
          <label className="space-y-2">
            <span className="label">Target role</span>
            <select className="input" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
              {targetRoles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </label>
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-zinc-950 p-6 text-center hover:border-cyan">
            <FileUp className="text-cyan" size={34} />
            <span className="mt-3 text-sm font-semibold text-white">{file?.name || "Choose PDF resume"}</span>
            <span className="mt-1 text-xs text-zinc-500">Rule-based parsing, PDF only, maximum 5 MB</span>
            <input className="hidden" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            <FileUp size={18} />
            {loading ? "Parsing and saving..." : "Upload and auto-fill profile"}
          </button>
        </form>

        <section className="card p-5">
          {result ? (
            <>
              <div className="flex items-center gap-3 text-mint">
                <CheckCircle2 size={24} />
                <p className="font-semibold">{result.message}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Name", result.extracted.name],
                  ["Resume email", result.extracted.email],
                  ["Phone", result.extracted.phone],
                  ["ATS score", result.analysis?.atsScore]
                ].map(([label, value]) => (
                  <div className="rounded-md border border-line bg-zinc-950 p-3" key={label}>
                    <p className="label">{label}</p>
                    <p className="mt-1 break-words text-sm text-white">{value || "Not detected"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <p className="label">Skills saved</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.extracted.skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {sections.map(([key, label]) => (
                  <div key={key}>
                    <p className="label">{label}</p>
                    <div className="mt-2 space-y-2">
                      {result.extracted[key]?.length ? result.extracted[key].map((item) => (
                        <p className="rounded-md border border-line bg-zinc-950 p-3 text-sm text-zinc-300" key={item}>{item}</p>
                      )) : <p className="text-sm text-zinc-500">Not detected</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center text-center text-sm text-zinc-500">
              Parsed contact details, profile links, skills, education, projects, experience, and certifications will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResumeUpload;
