import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

const checklist = [
  "One-page resume for internship applications",
  "Clear headline and target role",
  "Education section with degree and graduation year",
  "Two or more project entries with measurable impact",
  "GitHub and LinkedIn links included",
  "Skills grouped by language, frontend, backend, tools",
  "Certificate or coursework section",
  "ATS-friendly PDF filename",
  "No spelling or grammar issues",
  "Portfolio link included"
];

const ResumeChecklist = () => {
  const { user } = useAuth();
  const storageKey = `ramixaq_resume_${user?.id}`;
  const [checked, setChecked] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "[]"));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const progress = useMemo(() => Math.round((checked.length / checklist.length) * 100), [checked]);

  const toggle = (item) => {
    setChecked((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  };

  return (
    <div>
      <PageHeader eyebrow="Resume" title="Checklist" />

      <section className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-3xl font-bold text-white">{progress}%</p>
            <p className="text-sm text-zinc-400">Resume completion</p>
          </div>
          <CheckCircle2 className="text-mint" size={34} />
        </div>
        <div className="mt-4 h-3 rounded-full bg-zinc-950">
          <div className="h-3 rounded-full bg-mint" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {checklist.map((item) => (
          <label key={item} className="card flex cursor-pointer items-center gap-3 p-4 transition hover:border-zinc-500">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-line bg-zinc-950 accent-cyan"
              checked={checked.includes(item)}
              onChange={() => toggle(item)}
            />
            <span className={checked.includes(item) ? "text-zinc-500 line-through" : "text-zinc-100"}>{item}</span>
          </label>
        ))}
      </section>
    </div>
  );
};

export default ResumeChecklist;
