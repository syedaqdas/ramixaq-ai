import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

const InternshipMatcher = () => {
  const { user, setSessionUser } = useAuth();
  const navigate = useNavigate();
  const preferences = user?.internshipPreferences || {};
  const [form, setForm] = useState({
    desiredRole: preferences.desiredRole || "Software Developer Intern",
    locationPreference: preferences.locationPreference || "",
    workMode: preferences.workMode || "Any",
    experienceLevel: preferences.experienceLevel || "Entry Level",
    skills: user?.resumeData?.skills?.join(", ") || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      };
      const { data } = await api.post("/internships/match", payload);
      sessionStorage.setItem("ramixaq_internship_results", JSON.stringify(data));
      setSessionUser({
        ...user,
        internshipPreferences: {
          desiredRole: form.desiredRole,
          locationPreference: form.locationPreference,
          workMode: form.workMode,
          experienceLevel: form.experienceLevel
        }
      });
      navigate("/internships/results", { state: { results: data } });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate internship matches."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="AI internship matching" title="Find your strongest opportunities" />
      <form className="card grid gap-4 p-5 md:grid-cols-2" onSubmit={submit}>
        <FormInput label="Desired role" value={form.desiredRole} onChange={(event) => setForm({ ...form, desiredRole: event.target.value })} required />
        <FormInput label="Location preference" value={form.locationPreference} onChange={(event) => setForm({ ...form, locationPreference: event.target.value })} placeholder="Remote, Hyderabad, Bengaluru..." />
        <label className="space-y-2">
          <span className="label">Work mode</span>
          <select className="input" value={form.workMode} onChange={(event) => setForm({ ...form, workMode: event.target.value })}>
            {["Any", "Remote", "Hybrid", "On-site"].map((mode) => <option key={mode}>{mode}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="label">Experience level</span>
          <select className="input" value={form.experienceLevel} onChange={(event) => setForm({ ...form, experienceLevel: event.target.value })}>
            {["Beginner", "Entry Level", "Intermediate"].map((level) => <option key={level}>{level}</option>)}
          </select>
        </label>
        <FormInput
          className="md:col-span-2"
          label="Additional skills"
          value={form.skills}
          onChange={(event) => setForm({ ...form, skills: event.target.value })}
          placeholder="React, Node.js, MongoDB"
        />
        <div className="rounded-md border border-line bg-zinc-950 p-4 text-sm text-zinc-400 md:col-span-2">
          Matching also uses your saved skills, parsed resume, projects, certificates, and profile experience.
        </div>
        {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 md:col-span-2">{error}</p>}
        <button className="btn-primary md:col-span-2 md:w-fit" disabled={loading}>
          <Sparkles size={18} />
          {loading ? "Analyzing your profile..." : "Generate AI matches"}
        </button>
      </form>
    </div>
  );
};

export default InternshipMatcher;
