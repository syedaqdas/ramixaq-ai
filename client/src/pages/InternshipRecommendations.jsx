import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";

const InternshipRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ai/internships").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading internship matches...</p>;

  return (
    <div>
      <PageHeader eyebrow="AI Internship Engine" title="Recommended internships" />
      <div className="grid gap-4 xl:grid-cols-2">
        {data?.recommendations?.map((internship) => (
          <article className="card p-5" key={`${internship.company}-${internship.title}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan">
                  <GraduationCap size={18} />
                  <p className="text-sm font-semibold uppercase tracking-wide">{internship.mode}</p>
                </div>
                <h2 className="mt-2 text-xl font-bold text-white">{internship.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{internship.company} · {internship.location}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-bold text-white">{internship.matchScore}%</p>
                <p className="text-xs uppercase tracking-wide text-zinc-500">match</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">{internship.focus}</p>
            <div className="mt-4">
              <p className="label">Matched</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {internship.matchedSkills.map((skill) => <span className="chip border-mint/40 text-green-200" key={skill}>{skill}</span>)}
              </div>
            </div>
            <div className="mt-4">
              <p className="label">Improve match</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {internship.missingSkills.map((skill) => <span className="chip border-amber/40 text-amber-100" key={skill}>{skill}</span>)}
              </div>
            </div>
            <p className="mt-4 rounded-md border border-line bg-zinc-950 p-3 text-sm text-zinc-300">{internship.nextStep}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default InternshipRecommendations;

