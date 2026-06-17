import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { toDateInputValue } from "../utils/format";

const emptyGoal = {
  title: "",
  role: "",
  targetCompany: "",
  deadline: "",
  priority: "Medium",
  status: "Not Started",
  progress: 0,
  notes: ""
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(emptyGoal);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/goals")
      .then(({ data }) => setGoals(data))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const resetForm = () => {
    setForm(emptyGoal);
    setEditingId(null);
  };

  const goalPayload = () => ({
    ...form,
    progress: Number(form.progress || 0)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      const { data } = await api.put(`/goals/${editingId}`, goalPayload());
      setGoals(goals.map((goal) => (goal._id === editingId ? data : goal)));
    } else {
      const { data } = await api.post("/goals", goalPayload());
      setGoals([data, ...goals]);
    }

    resetForm();
  };

  const handleEdit = (goal) => {
    setEditingId(goal._id);
    setForm({
      title: goal.title || "",
      role: goal.role || "",
      targetCompany: goal.targetCompany || "",
      deadline: toDateInputValue(goal.deadline),
      priority: goal.priority || "Medium",
      status: goal.status || "Not Started",
      progress: goal.progress || 0,
      notes: goal.notes || ""
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/goals/${id}`);
    setGoals(goals.filter((goal) => goal._id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div>
      <PageHeader eyebrow="Internship targets" title="Goals" />

      <form className="card grid gap-4 p-5 lg:grid-cols-6" onSubmit={handleSubmit}>
        <FormInput className="lg:col-span-2" label="Goal" value={form.title} onChange={updateForm("title")} required />
        <FormInput className="lg:col-span-2" label="Role" value={form.role} onChange={updateForm("role")} />
        <FormInput className="lg:col-span-2" label="Company" value={form.targetCompany} onChange={updateForm("targetCompany")} />
        <FormInput className="lg:col-span-2" label="Deadline" type="date" value={form.deadline} onChange={updateForm("deadline")} />
        <label className="space-y-2">
          <span className="label">Priority</span>
          <select className="input" value={form.priority} onChange={updateForm("priority")}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="label">Status</span>
          <select className="input" value={form.status} onChange={updateForm("status")}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>
        <FormInput className="lg:col-span-2" label="Progress" type="number" min="0" max="100" value={form.progress} onChange={updateForm("progress")} />
        <FormInput className="lg:col-span-6" label="Notes" textarea value={form.notes} onChange={updateForm("notes")} />
        <div className="flex gap-3 lg:col-span-6">
          <button className="btn-primary">
            <Plus size={18} />
            {editingId ? "Update goal" : "Add goal"}
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
          <p className="text-zinc-400">Loading goals...</p>
        ) : goals.length ? (
          goals.map((goal) => (
            <article className="card p-5" key={goal._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{goal.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {[goal.role, goal.targetCompany].filter(Boolean).join(" · ") || "Internship goal"}
                  </p>
                </div>
                <StatusBadge value={goal.priority} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusBadge value={goal.status} />
                {goal.deadline && <span className="text-sm text-zinc-500">{toDateInputValue(goal.deadline)}</span>}
              </div>
              <div className="mt-4 h-2 rounded-full bg-zinc-950">
                <div className="h-2 rounded-full bg-cyan" style={{ width: `${goal.progress || 0}%` }} />
              </div>
              {goal.notes && <p className="mt-4 text-sm leading-6 text-zinc-400">{goal.notes}</p>}
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary px-3" onClick={() => handleEdit(goal)} aria-label={`Edit ${goal.title}`}>
                  <Edit3 size={16} />
                </button>
                <button className="btn-danger" onClick={() => handleDelete(goal._id)} aria-label={`Delete ${goal.title}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No goals yet" message="Create internship goals and track progress toward applications." />
        )}
      </section>
    </div>
  );
};

export default Goals;

