import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

const emptySkill = {
  name: "",
  category: "Technical",
  level: "Beginner",
  yearsExperience: 0,
  priority: "Medium",
  targetRole: "",
  notes: ""
};

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(emptySkill);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    const { data } = await api.get("/skills");
    setSkills(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSkills().catch(() => setLoading(false));
  }, []);

  const updateForm = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const resetForm = () => {
    setForm(emptySkill);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, yearsExperience: Number(form.yearsExperience || 0) };

    if (editingId) {
      const { data } = await api.put(`/skills/${editingId}`, payload);
      setSkills(skills.map((skill) => (skill._id === editingId ? data : skill)));
    } else {
      const { data } = await api.post("/skills", payload);
      setSkills([data, ...skills]);
    }

    resetForm();
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);
    setForm({
      name: skill.name || "",
      category: skill.category || "Technical",
      level: skill.level || "Beginner",
      yearsExperience: skill.yearsExperience || 0,
      priority: skill.priority || "Medium",
      targetRole: skill.targetRole || "",
      notes: skill.notes || ""
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/skills/${id}`);
    setSkills(skills.filter((skill) => skill._id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div>
      <PageHeader eyebrow="Capability map" title="Skills" />

      <form className="card grid gap-4 p-5 lg:grid-cols-6" onSubmit={handleSubmit}>
        <FormInput className="lg:col-span-2" label="Skill" value={form.name} onChange={updateForm("name")} required />
        <FormInput label="Category" value={form.category} onChange={updateForm("category")} />
        <label className="space-y-2">
          <span className="label">Level</span>
          <select className="input" value={form.level} onChange={updateForm("level")}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="label">Priority</span>
          <select className="input" value={form.priority} onChange={updateForm("priority")}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <FormInput label="Years" type="number" min="0" value={form.yearsExperience} onChange={updateForm("yearsExperience")} />
        <FormInput className="lg:col-span-3" label="Target role" value={form.targetRole} onChange={updateForm("targetRole")} />
        <FormInput className="lg:col-span-3" label="Notes" value={form.notes} onChange={updateForm("notes")} />
        <div className="flex gap-3 lg:col-span-6">
          <button className="btn-primary">
            <Plus size={18} />
            {editingId ? "Update skill" : "Add skill"}
          </button>
          {editingId && (
            <button className="btn-secondary" type="button" onClick={resetForm}>
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-zinc-400">Loading skills...</p>
        ) : skills.length ? (
          skills.map((skill) => (
            <article className="card p-5" key={skill._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{skill.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{skill.category}</p>
                </div>
                <StatusBadge value={skill.priority} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip">{skill.level}</span>
                <span className="chip">{skill.yearsExperience || 0} yrs</span>
                {skill.targetRole && <span className="chip">{skill.targetRole}</span>}
              </div>
              {skill.notes && <p className="mt-4 text-sm leading-6 text-zinc-400">{skill.notes}</p>}
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary px-3" onClick={() => handleEdit(skill)} aria-label={`Edit ${skill.name}`}>
                  <Edit3 size={16} />
                </button>
                <button className="btn-danger" onClick={() => handleDelete(skill._id)} aria-label={`Delete ${skill.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No skills yet" message="Add your first skill to start building the roadmap." />
        )}
      </section>
    </div>
  );
};

export default Skills;

