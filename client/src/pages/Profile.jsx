import { Save } from "lucide-react";
import { useState } from "react";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    location: user?.location || "",
    avatarUrl: user?.avatarUrl || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    website: user?.website || ""
  });
  const [status, setStatus] = useState("");

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    await updateProfile(form);
    setStatus("Profile saved");
  };

  return (
    <div>
      <PageHeader eyebrow="Public profile" title="Profile settings" />
      <form className="card grid gap-4 p-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <FormInput label="Name" value={form.name} onChange={handleChange("name")} required />
        <FormInput label="Headline" value={form.headline} onChange={handleChange("headline")} />
        <FormInput label="Location" value={form.location} onChange={handleChange("location")} />
        <FormInput label="Avatar URL" value={form.avatarUrl} onChange={handleChange("avatarUrl")} />
        <FormInput label="GitHub" value={form.github} onChange={handleChange("github")} />
        <FormInput label="LinkedIn" value={form.linkedin} onChange={handleChange("linkedin")} />
        <FormInput label="Website" value={form.website} onChange={handleChange("website")} />
        <FormInput className="md:col-span-2" label="Bio" textarea value={form.bio} onChange={handleChange("bio")} />
        <div className="flex items-center gap-3 md:col-span-2">
          <button className="btn-primary">
            <Save size={18} />
            Save profile
          </button>
          {status && <span className="text-sm text-mint">{status}</span>}
        </div>
      </form>
    </div>
  );
};

export default Profile;

