import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/roadmap")
      .then(({ data }) => setRoadmap(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading roadmap...</p>;

  return (
    <div>
      <PageHeader eyebrow="Skill planning" title="Roadmap">
        <Link className="btn-secondary" to="/skills">
          <Plus size={18} />
          Add skill
        </Link>
      </PageHeader>

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

