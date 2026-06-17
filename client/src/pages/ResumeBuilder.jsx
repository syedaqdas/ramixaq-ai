import { Download, FileText } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";

const ResumeBuilder = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const downloadResume = async () => {
    setDownloading(true);
    setError("");
    try {
      const response = await api.get("/resume/download", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ramixaq-ai-resume.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not generate the resume PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Resume Builder" title="Downloadable PDF resume" />

      <section className="card grid gap-5 p-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <FileText className="text-cyan" size={34} />
          <h2 className="mt-4 text-xl font-bold text-white">Generate from profile data</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            The PDF is assembled from your profile, skills, projects, certificates, and internship goals, so your dashboard becomes your resume source of truth.
          </p>
          <button className="btn-primary mt-5" onClick={downloadResume} disabled={downloading}>
            <Download size={18} />
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          {error && <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        </div>
        <div className="rounded-lg border border-line bg-zinc-950 p-5">
          <p className="label">Included sections</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["Contact", "Headline", "Bio", "Skills", "Projects", "Certificates", "Goals"].map((section) => (
              <div className="rounded-md border border-line bg-panel p-3 text-sm text-zinc-300" key={section}>{section}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResumeBuilder;

