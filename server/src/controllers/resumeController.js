import PDFDocument from "pdfkit";
import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import { logActivity } from "../utils/activity.js";

const addSection = (doc, title) => {
  doc.moveDown(1.2).fontSize(15).fillColor("#111827").text(title).moveTo(doc.x, doc.y + 2).lineTo(540, doc.y + 2).strokeColor("#d1d5db").stroke();
  doc.moveDown(0.6).fillColor("#111827");
};

export const downloadResume = async (req, res, next) => {
  try {
    const [skills, projects, certificates, goals] = await Promise.all([
      Skill.find({ user: req.user._id }).sort({ category: 1, name: 1 }),
      Project.find({ user: req.user._id }).sort({ featured: -1, createdAt: -1 }),
      Certificate.find({ user: req.user._id }).sort({ issueDate: -1 }),
      Goal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(3)
    ]);

    const doc = new PDFDocument({ margin: 52, size: "A4" });
    const fileName = `${req.user.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-resume.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    doc.fontSize(24).fillColor("#111827").text(req.user.name, { continued: false });
    doc.fontSize(11).fillColor("#4b5563").text([req.user.email, req.user.location, req.user.github, req.user.linkedin].filter(Boolean).join(" | "));
    doc.moveDown(0.8).fontSize(12).fillColor("#111827").text(req.user.headline || "Aspiring software intern");
    if (req.user.bio) doc.moveDown(0.4).fontSize(10).fillColor("#374151").text(req.user.bio);

    addSection(doc, "Skills");
    doc.fontSize(10).text(skills.map((skill) => `${skill.name} (${skill.level})`).join(", ") || "Add skills in Ramixaq AI.");

    addSection(doc, "Projects");
    projects.slice(0, 4).forEach((project) => {
      doc.fontSize(11).fillColor("#111827").text(project.title, { continued: true }).fillColor("#6b7280").text(`  ${project.status}`);
      doc.fontSize(10).fillColor("#374151").text(project.description);
      if (project.techStack.length) doc.fillColor("#4b5563").text(project.techStack.join(", "));
      doc.moveDown(0.5);
    });

    addSection(doc, "Certificates");
    certificates.slice(0, 5).forEach((certificate) => {
      doc.fontSize(10).fillColor("#111827").text(`${certificate.title} - ${certificate.issuer}`);
    });

    addSection(doc, "Internship Goals");
    goals.forEach((goal) => {
      doc.fontSize(10).fillColor("#111827").text(`${goal.title} - ${goal.status} (${goal.progress || 0}%)`);
    });

    doc.end();

    await logActivity({
      user: req.user._id,
      type: "resume.download",
      message: "Resume PDF generated",
      metadata: { fileName },
      ip: req.ip
    });
  } catch (error) {
    next(error);
  }
};

