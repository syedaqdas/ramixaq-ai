import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";

const Achievements = () => {
  const [achievements, setAchievements] = useState(null);

  useEffect(() => {
    api.get("/achievements").then(({ data }) => setAchievements(data));
  }, []);

  if (!achievements) return <p className="text-zinc-400">Loading achievements...</p>;

  return (
    <div>
      <PageHeader eyebrow="Achievement System" title="XP, badges, and level progression" />

      <section className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan">Level {achievements.level}</p>
            <p className="mt-2 text-5xl font-bold text-white">{achievements.xp} XP</p>
            <p className="mt-2 text-sm text-zinc-500">{achievements.nextLevelXp - achievements.xp} XP to next level</p>
          </div>
          <Trophy className="text-amber" size={54} />
        </div>
        <div className="mt-6 h-3 rounded-full bg-zinc-950">
          <div className="h-3 rounded-full bg-amber" style={{ width: `${achievements.progressToNextLevel}%` }} />
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {achievements.badges.map((badge) => (
          <article className="card p-5" key={badge.name}>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-amber/40 bg-amber/10 text-amber">
                <Trophy size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-white">{badge.name}</h2>
                <p className="text-sm text-zinc-500">{badge.description}</p>
              </div>
            </div>
          </article>
        ))}
        {!achievements.badges.length && (
          <div className="card p-5 text-sm text-zinc-400">Add skills, projects, certificates, and resume scans to unlock badges.</div>
        )}
      </section>
    </div>
  );
};

export default Achievements;

