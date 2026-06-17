import { Download, Globe2, RefreshCw } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";

const PortfolioGenerator = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const { data } = await api.get("/portfolio/generate");
    setPortfolio(data);
    setLoading(false);
  };

  const downloadHtml = () => {
    const blob = new Blob([portfolio.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ramixaq-portfolio.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader eyebrow="Public Portfolio Website Generator" title="Generate portfolio site">
        <button className="btn-primary" onClick={generate} disabled={loading}>
          <RefreshCw size={18} />
          {loading ? "Generating..." : "Generate"}
        </button>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="card p-5">
          <Globe2 className="text-cyan" size={30} />
          <h2 className="mt-4 text-xl font-bold text-white">Automatic portfolio</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Ramixaq AI turns your profile, skills, projects, certificates, and internship goals into a single-page portfolio website.
          </p>
          {portfolio && (
            <div className="mt-5 space-y-3">
              <a className="btn-secondary w-full" href={portfolio.publicUrl} target="_blank" rel="noreferrer">
                <Globe2 size={18} />
                Open public data endpoint
              </a>
              <button className="btn-primary w-full" onClick={downloadHtml}>
                <Download size={18} />
                Download HTML
              </button>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(portfolio.sections).map(([key, value]) => (
                  <div className="rounded-md border border-line bg-zinc-950 p-3" key={key}>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="capitalize text-zinc-500">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="card overflow-hidden p-0">
          {portfolio ? (
            <iframe className="h-[620px] w-full bg-white" title="Generated portfolio preview" srcDoc={portfolio.html} />
          ) : (
            <div className="grid h-[420px] place-items-center p-6 text-center text-zinc-500">
              Generate a portfolio to preview the website here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PortfolioGenerator;

