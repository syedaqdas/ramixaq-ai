import { ArrowLeft, BriefcaseBusiness, ExternalLink, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const readStoredResults = () => {
  try {
    return JSON.parse(sessionStorage.getItem("ramixaq_internship_results"));
  } catch {
    return null;
  }
};

const InternshipResults = () => {
  const location = useLocation();
  const data = location.state?.results || readStoredResults();

  if (!data) {
    return (
      <div>
        <PageHeader eyebrow="Internship results" title="No matching session found" />
        <Link className="btn-primary" to="/internships/matcher">
          <ArrowLeft size={18} />
          Start a match
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="AI internship results" title="Your strongest matches">
        <Link className="btn-secondary" to="/internships/matcher">
          <ArrowLeft size={18} />
          Adjust preferences
        </Link>
      </PageHeader>

      <section className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="label">Application readiness</p>
          <p className="mt-2 text-4xl font-bold text-cyan">{data.applicationReadinessScore}%</p>
        </div>
        <div className="card p-5">
          <p className="label">Best roles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.bestRoles.map((role) => <span className="chip" key={role}>{role}</span>)}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.recommendations.map((internship) => (
          <article className="card p-5" key={internship.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan">
                  <BriefcaseBusiness size={18} />
                  <span className="text-sm font-semibold">{internship.company}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-white">{internship.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                  <MapPin size={15} />
                  {internship.location} - {internship.remoteType}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{internship.matchScore}%</p>
                <p className="text-xs uppercase tracking-wide text-zinc-500">match</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">{internship.description}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label">Why you match</p>
                <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                  {internship.whyMatches.map((reason) => <li key={reason}>- {reason}</li>)}
                </ul>
              </div>
              <div>
                <p className="label">Missing skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {internship.missingSkills.map((skill) => <span className="chip border-amber/40 text-amber-100" key={skill}>{skill}</span>)}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="label">Suggested improvements</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                {internship.suggestedImprovements.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="text-sm text-zinc-400">
                <p>{internship.stipend}</p>
                <p>Apply by {new Date(internship.deadline).toLocaleDateString()}</p>
              </div>
              <a className="btn-primary" href={internship.applyLink} target="_blank" rel="noreferrer">
                Apply
                <ExternalLink size={17} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default InternshipResults;
