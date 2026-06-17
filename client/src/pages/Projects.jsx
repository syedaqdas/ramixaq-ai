import { Edit3, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { externalUrl } from "../utils/format";

const emptyProject = {
  title: "",
  description: "",
  techStack: "",
  githubLink: "",
  liveLink: "",
  status: "Planned",
  featured: false
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/projects")
      .then(({ data }) => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (field) => (event) => {
    const value = field === "featured" ? event.target.checked : event.target.value;
    setForm({ ...form, [field]: value });
  };

  const resetForm = () => {
    setForm(emptyProject);
    setEditingId(null);
  };

  const payload = () => ({
    ...form,
    techStack: form.techStack.split(",").map((tech) => tech.trim()).filter(Boolean)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      const { data } = await api.put(`/projects/${editingId}`, payload());
      setProjects(projects.map((project) => (project._id === editingId ? data : project)));
    } else {
      const { data } = await api.post("/projects", payload());
      setProjects([data, ...projects]);
    }

    resetForm();
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({
      title: project.title || "",
      description: project.description || "",
      techStack: project.techStack?.join(", ") || "",
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      status: project.status || "Planned",
      featured: Boolean(project.featured)
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(projects.filter((project) => project._id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div>
      <PageHeader eyebrow="Portfolio work" title="Projects" />

      <form className="card grid gap-4 p-5 lg:grid-cols-6" onSubmit={handleSubmit}>
        <FormInput className="lg:col-span-2" label="Title" value={form.title} onChange={updateForm("title")} required />
        <label className="space-y-2">
          <span className="label">Status</span>
          <select className="input" value={form.status} onChange={updateForm("status")}>
            <option>Planned</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Archived</option>
          </select>
        </label>
        <FormInput className="lg:col-span-3" label="Tech stack" value={form.techStack} onChange={updateForm("techStack")} placeholder="React, Node.js, MongoDB" />
        <FormInput className="lg:col-span-3" label="GitHub link" value={form.githubLink} onChange={updateForm("githubLink")} />
        <FormInput className="lg:col-span-3" label="Live link" value={form.liveLink} onChange={updateForm("liveLink")} />
        <FormInput className="lg:col-span-6" label="Description" textarea value={form.description} onChange={updateForm("description")} required />
        <label className="flex items-center gap-3 text-sm text-zinc-300 lg:col-span-6">
          <input type="checkbox" className="h-5 w-5 rounded border-line bg-zinc-950 accent-cyan" checked={form.featured} onChange={updateForm("featured")} />
          Featured project
        </label>
        <div className="flex gap-3 lg:col-span-6">
          <button className="btn-primary">
            <Plus size={18} />
            {editingId ? "Update project" : "Add project"}
          </button>
          {editingId && (
            <button className="btn-secondary" type="button" onClick={resetForm}>
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        {loading ? (
          <p className="text-zinc-400">Loading projects...</p>
        ) : projects.length ? (
          projects.map((project) => (
            <article className="card p-5" key={project._id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{project.title}</h2>
                  {project.featured && <p className="mt-1 text-sm text-cyan">Featured</p>}
                </div>
                <StatusBadge value={project.status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack?.map((tech) => <span className="chip" key={tech}>{tech}</span>)}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {project.githubLink && (
                  <a className="btn-secondary px-3" href={externalUrl(project.githubLink)} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    GitHub
                  </a>
                )}
                {project.liveLink && (
                  <a className="btn-secondary px-3" href={externalUrl(project.liveLink)} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    Live
                  </a>
                )}
                <button className="btn-secondary px-3" onClick={() => handleEdit(project)} aria-label={`Edit ${project.title}`}>
                  <Edit3 size={16} />
                </button>
                <button className="btn-danger" onClick={() => handleDelete(project._id)} aria-label={`Delete ${project.title}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No projects yet" message="Add a project with stack, repository, live link, and status." />
        )}
      </section>
    </div>
  );
};

export default Projects;

