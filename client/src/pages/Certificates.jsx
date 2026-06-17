import { Edit3, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { externalUrl, toDateInputValue } from "../utils/format";

const emptyCertificate = {
  title: "",
  issuer: "",
  credentialId: "",
  credentialUrl: "",
  issueDate: "",
  expiryDate: "",
  notes: ""
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState(emptyCertificate);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/certificates")
      .then(({ data }) => setCertificates(data))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const resetForm = () => {
    setForm(emptyCertificate);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      const { data } = await api.put(`/certificates/${editingId}`, form);
      setCertificates(certificates.map((certificate) => (certificate._id === editingId ? data : certificate)));
    } else {
      const { data } = await api.post("/certificates", form);
      setCertificates([data, ...certificates]);
    }

    resetForm();
  };

  const handleEdit = (certificate) => {
    setEditingId(certificate._id);
    setForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      credentialId: certificate.credentialId || "",
      credentialUrl: certificate.credentialUrl || "",
      issueDate: toDateInputValue(certificate.issueDate),
      expiryDate: toDateInputValue(certificate.expiryDate),
      notes: certificate.notes || ""
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/certificates/${id}`);
    setCertificates(certificates.filter((certificate) => certificate._id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div>
      <PageHeader eyebrow="Credentials" title="Certificates" />

      <form className="card grid gap-4 p-5 lg:grid-cols-6" onSubmit={handleSubmit}>
        <FormInput className="lg:col-span-3" label="Title" value={form.title} onChange={updateForm("title")} required />
        <FormInput className="lg:col-span-3" label="Issuer" value={form.issuer} onChange={updateForm("issuer")} required />
        <FormInput className="lg:col-span-2" label="Credential ID" value={form.credentialId} onChange={updateForm("credentialId")} />
        <FormInput className="lg:col-span-4" label="Credential URL" value={form.credentialUrl} onChange={updateForm("credentialUrl")} />
        <FormInput className="lg:col-span-2" label="Issue date" type="date" value={form.issueDate} onChange={updateForm("issueDate")} />
        <FormInput className="lg:col-span-2" label="Expiry date" type="date" value={form.expiryDate} onChange={updateForm("expiryDate")} />
        <FormInput className="lg:col-span-2" label="Notes" value={form.notes} onChange={updateForm("notes")} />
        <div className="flex gap-3 lg:col-span-6">
          <button className="btn-primary">
            <Plus size={18} />
            {editingId ? "Update certificate" : "Add certificate"}
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
          <p className="text-zinc-400">Loading certificates...</p>
        ) : certificates.length ? (
          certificates.map((certificate) => (
            <article className="card p-5" key={certificate._id}>
              <h2 className="text-lg font-semibold text-white">{certificate.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{certificate.issuer}</p>
              <div className="mt-4 space-y-1 text-sm text-zinc-400">
                {certificate.credentialId && <p>ID: {certificate.credentialId}</p>}
                {certificate.issueDate && <p>Issued: {toDateInputValue(certificate.issueDate)}</p>}
                {certificate.expiryDate && <p>Expires: {toDateInputValue(certificate.expiryDate)}</p>}
              </div>
              {certificate.notes && <p className="mt-4 text-sm leading-6 text-zinc-400">{certificate.notes}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                {certificate.credentialUrl && (
                  <a className="btn-secondary px-3" href={externalUrl(certificate.credentialUrl)} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    View
                  </a>
                )}
                <button className="btn-secondary px-3" onClick={() => handleEdit(certificate)} aria-label={`Edit ${certificate.title}`}>
                  <Edit3 size={16} />
                </button>
                <button className="btn-danger" onClick={() => handleDelete(certificate._id)} aria-label={`Delete ${certificate.title}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No certificates yet" message="Add certificates, badges, and verified coursework." />
        )}
      </section>
    </div>
  );
};

export default Certificates;

