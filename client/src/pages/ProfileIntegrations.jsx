import { BadgeCheck, Code2, Github, Globe, Linkedin, Save } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../api/errors";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

const integrationFields = [
  { field: "linkedin", label: "LinkedIn profile URL", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
  { field: "github", label: "GitHub profile URL", icon: Github, placeholder: "https://github.com/username" },
  { field: "leetcode", label: "LeetCode profile URL", icon: Code2, placeholder: "https://leetcode.com/u/username" },
  { field: "portfolio", label: "Portfolio URL", icon: Globe, placeholder: "https://your-portfolio.com" }
];

const ProfileIntegrations = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() =>
    Object.fromEntries(integrationFields.map(({ field }) => [field, user?.[field] || ""]))
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateProfile(form);
      setMessage("Profile integrations saved");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save integrations."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Profile integrations" title="Connect your public profiles" />
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        {integrationFields.map(({ field, label, icon: Icon, placeholder }) => {
          const connected = Boolean(user?.[field]);
          return (
            <section className="card p-5" key={field}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <Icon className="text-cyan" size={24} />
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${connected ? "text-mint" : "text-zinc-500"}`}>
                  <BadgeCheck size={15} />
                  {connected ? "Connected" : "Not connected"}
                </span>
              </div>
              <FormInput
                label={label}
                type="url"
                value={form[field]}
                placeholder={placeholder}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              />
              <p className="mt-3 text-xs text-zinc-500">OAuth and provider API synchronization can be added later without changing this saved URL.</p>
            </section>
          );
        })}
        {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 md:col-span-2">{error}</p>}
        <div className="flex items-center gap-3 md:col-span-2">
          <button className="btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? "Saving..." : "Save integrations"}
          </button>
          {message && <span className="text-sm text-mint">{message}</span>}
        </div>
      </form>
    </div>
  );
};

export default ProfileIntegrations;
