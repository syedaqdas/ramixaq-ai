import { BadgeCheck, Download, ExternalLink, Link2, Save, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile, setSessionUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
    publicSlug: user?.publicSlug || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    leetcode: user?.leetcode || "",
    portfolio: user?.portfolio || user?.website || ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      await updateProfile(form);
      setStatus("Profile saved");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save your profile."));
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    setUploading(true);
    setError("");
    try {
      const response = await api.post("/profile/avatar", data);
      setSessionUser(response.data.user);
      setStatus("Profile photo updated");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload the profile photo."));
    } finally {
      setUploading(false);
    }
  };

  const exportProfile = async () => {
    setError("");
    try {
      const response = await api.get("/profile/export", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${user.publicSlug || "ramixaq-profile"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not export your profile."));
    }
  };

  const resendVerification = async () => {
    setError("");
    try {
      const { data } = await api.post("/auth/resend-verification");
      setStatus(data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send a verification email."));
    }
  };

  const publicSlug = user?.publicSlug || form.publicSlug;
  const publicUrl = `${window.location.origin}/p/${publicSlug}`;

  return (
    <div>
      <PageHeader eyebrow="Public profile" title="Profile settings">
        <div className="flex flex-wrap gap-2">
          <Link className="btn-secondary" to="/profile/integrations">
            <Link2 size={18} />
            Integrations
          </Link>
          <button className="btn-secondary" onClick={exportProfile}>
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </PageHeader>

      <section className="card mb-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-zinc-950 text-2xl font-bold text-cyan">
          {user?.avatarUrl ? <img className="h-full w-full object-cover" src={user.avatarUrl} alt={user.name} /> : user?.name?.slice(0, 2)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">Profile photo</p>
          <p className="mt-1 text-sm text-zinc-500">JPG, PNG, or WebP. Maximum 2 MB.</p>
          <label className="btn-secondary mt-3 cursor-pointer">
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload photo"}
            <input
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(event) => uploadAvatar(event.target.files?.[0])}
            />
          </label>
        </div>
        <div className={`rounded-md border p-3 text-sm ${user?.emailVerified ? "border-mint/30 bg-mint/10 text-green-200" : "border-amber/30 bg-amber/10 text-amber-100"}`}>
          <BadgeCheck className="mr-2 inline" size={17} />
          {user?.emailVerified ? "Email verified" : "Email not verified"}
          {!user?.emailVerified && <button className="ml-3 font-semibold underline" onClick={resendVerification}>Send link</button>}
        </div>
      </section>

      <form className="card grid gap-4 p-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <FormInput label="Name" value={form.name} onChange={handleChange("name")} required />
        <FormInput label="Headline" value={form.headline} onChange={handleChange("headline")} />
        <FormInput label="Location" value={form.location} onChange={handleChange("location")} />
        <FormInput label="Phone" type="tel" value={form.phone} onChange={handleChange("phone")} />
        <FormInput label="Public profile URL slug" value={form.publicSlug} onChange={handleChange("publicSlug")} placeholder="your-name" />
        <FormInput label="GitHub profile URL" type="url" value={form.github} onChange={handleChange("github")} />
        <FormInput label="LinkedIn profile URL" type="url" value={form.linkedin} onChange={handleChange("linkedin")} />
        <FormInput label="LeetCode profile URL" type="url" value={form.leetcode} onChange={handleChange("leetcode")} />
        <FormInput label="Portfolio website URL" type="url" value={form.portfolio} onChange={handleChange("portfolio")} />
        <FormInput className="md:col-span-2" label="Bio" textarea value={form.bio} onChange={handleChange("bio")} />
        {publicSlug && (
          <div className="rounded-md border border-line bg-zinc-950 p-3 text-sm text-zinc-400 md:col-span-2">
            <span className="break-all">{publicUrl}</span>
            <a className="ml-3 font-semibold text-cyan" href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="inline" size={15} /> Open
            </a>
          </div>
        )}
        {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 md:col-span-2">{error}</p>}
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
