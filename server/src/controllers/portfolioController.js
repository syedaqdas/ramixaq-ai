import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const generatePortfolio = async (req, res, next) => {
  try {
    const [skills, projects, certificates, goals] = await Promise.all([
      Skill.find({ user: req.user._id }).sort({ category: 1, name: 1 }),
      Project.find({ user: req.user._id, status: { $ne: "Archived" } }).sort({ featured: -1, createdAt: -1 }),
      Certificate.find({ user: req.user._id }).sort({ issueDate: -1 }),
      Goal.find({ user: req.user._id }).sort({ createdAt: -1 })
    ]);

    const publicUrl = `${req.protocol}://${req.get("host")}/api/public/profile/${req.user._id}`;
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(req.user.name)} | Ramixaq AI Portfolio</title>
  <style>
    body{margin:0;font-family:Inter,Arial,sans-serif;background:#09090b;color:#f4f4f5;line-height:1.6}
    main{max-width:1040px;margin:auto;padding:40px 20px}
    section{border-top:1px solid #27272a;padding:28px 0}
    h1{font-size:44px;line-height:1.05;margin:0 0 10px}
    h2{font-size:24px;margin:0 0 16px}
    .muted{color:#a1a1aa}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
    .card{border:1px solid #27272a;border-radius:8px;background:#111113;padding:18px}
    .chip{display:inline-block;border:1px solid #27272a;border-radius:999px;padding:6px 10px;margin:4px;color:#d4d4d8}
    a{color:#22d3ee}
  </style>
</head>
<body>
  <main>
    <p class="muted">Ramixaq AI Portfolio</p>
    <h1>${escapeHtml(req.user.name)}</h1>
    <p>${escapeHtml(req.user.headline)}</p>
    <p class="muted">${escapeHtml(req.user.bio)}</p>
    <section>
      <h2>Skills</h2>
      ${skills.map((skill) => `<span class="chip">${escapeHtml(skill.name)} · ${escapeHtml(skill.level)}</span>`).join("")}
    </section>
    <section>
      <h2>Projects</h2>
      <div class="grid">
        ${projects
          .map(
            (project) => `<article class="card"><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(
              project.description
            )}</p><p class="muted">${escapeHtml(project.techStack.join(", "))}</p></article>`
          )
          .join("")}
      </div>
    </section>
    <section>
      <h2>Certificates</h2>
      ${certificates.map((certificate) => `<p>${escapeHtml(certificate.title)} · ${escapeHtml(certificate.issuer)}</p>`).join("")}
    </section>
    <section>
      <h2>Internship Goals</h2>
      ${goals.map((goal) => `<p>${escapeHtml(goal.title)} · ${escapeHtml(goal.status)}</p>`).join("")}
    </section>
  </main>
</body>
</html>`;

    res.json({
      publicUrl,
      html,
      sections: {
        skills: skills.length,
        projects: projects.length,
        certificates: certificates.length,
        goals: goals.length
      }
    });
  } catch (error) {
    next(error);
  }
};

