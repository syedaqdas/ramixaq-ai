import { Award, BadgeCheck, BriefcaseBusiness, Code2, Github, Globe, Linkedin, MapPin, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import BrandLogo from "../components/BrandLogo";
import DeveloperCredit from "../components/DeveloperCredit";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import { externalUrl } from "../utils/format";

const Portfolio = () => {
  const { userId, slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(slug ? `/public/portfolio/${slug}` : `/public/profile/${userId}`)
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId, slug]);

  if (loading) return <main className="grid min-h-screen place-items-center text-zinc-400">Loading portfolio...</main>;
  if (!profile) return <main className="grid min-h-screen place-items-center text-zinc-400">Portfolio not found</main>;

  const { user, skills, projects, certificates, goals } = profile;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-3" to="/" aria-label="Ramixaq AI home">
            <BrandLogo size="sm" />
            <span className="text-sm font-semibold text-cyan">Ramixaq AI</span>
          </Link>
          <ThemeToggle />
        </div>

        <section className="mt-6 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_0.65fr]">
          <div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-lg border border-line bg-panelSoft text-3xl font-bold text-cyan">
                {user.avatarUrl ? <img className="h-full w-full object-cover" src={user.avatarUrl} alt={user.name} /> : user.name?.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-3xl font-bold text-white sm:text-4xl">{user.name}</h1>
                <p className="mt-2 text-lg text-zinc-300">{user.headline}</p>
                {user.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                    <MapPin size={16} />
                    {user.location}
                  </p>
                )}
              </div>
            </div>
            {user.bio && <p className="mt-6 max-w-3xl leading-7 text-zinc-300">{user.bio}</p>}
          </div>

          <div className="card p-5">
            <p className="label">Links</p>
            <div className="mt-4 space-y-3">
              {user.github && <a className="btn-secondary w-full justify-start" href={externalUrl(user.github)} target="_blank" rel="noreferrer"><Github size={18} />GitHub</a>}
              {user.linkedin && <a className="btn-secondary w-full justify-start" href={externalUrl(user.linkedin)} target="_blank" rel="noreferrer"><Linkedin size={18} />LinkedIn</a>}
              {user.leetcode && <a className="btn-secondary w-full justify-start" href={externalUrl(user.leetcode)} target="_blank" rel="noreferrer"><Code2 size={18} />LeetCode</a>}
              {(user.portfolio || user.website) && <a className="btn-secondary w-full justify-start" href={externalUrl(user.portfolio || user.website)} target="_blank" rel="noreferrer"><Globe size={18} />Portfolio</a>}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="card p-4"><BadgeCheck className="text-cyan" /><p className="mt-3 text-2xl font-bold">{skills.length}</p><p className="text-sm text-zinc-500">Skills</p></div>
          <div className="card p-4"><BriefcaseBusiness className="text-mint" /><p className="mt-3 text-2xl font-bold">{projects.length}</p><p className="text-sm text-zinc-500">Projects</p></div>
          <div className="card p-4"><Award className="text-amber" /><p className="mt-3 text-2xl font-bold">{certificates.length}</p><p className="text-sm text-zinc-500">Certificates</p></div>
          <div className="card p-4"><Target className="text-red-300" /><p className="mt-3 text-2xl font-bold">{goals.length}</p><p className="text-sm text-zinc-500">Goals</p></div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <article className="card p-5" key={project._id}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <StatusBadge value={project.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => <span className="chip" key={tech}>{tech}</span>)}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-cyan">
                  {project.githubLink && <a href={externalUrl(project.githubLink)} target="_blank" rel="noreferrer">GitHub</a>}
                  {project.liveLink && <a href={externalUrl(project.liveLink)} target="_blank" rel="noreferrer">Live</a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => <span className="chip" key={skill._id}>{skill.name} - {skill.level}</span>)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Certificates</h2>
            <div className="mt-4 space-y-3">
              {certificates.map((certificate) => (
                <div className="card p-4" key={certificate._id}>
                  <p className="font-semibold text-white">{certificate.title}</p>
                  <p className="text-sm text-zinc-500">{certificate.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <DeveloperCredit className="mt-10 border-t border-line py-6" />
      </div>
    </main>
  );
};

export default Portfolio;
