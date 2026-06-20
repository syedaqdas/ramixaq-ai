import PDFDocument from "pdfkit";
import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import { publicUser } from "./authController.js";
import { uploadProfileImage } from "../utils/cloudinary.js";
import { createNotification } from "../utils/notification.js";

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required" });
    }

    const uploaded = await uploadProfileImage(req.file, req.user._id);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatarUrl: uploaded.url,
        avatarPublicId: uploaded.publicId
      },
      { new: true, runValidators: true }
    );

    await createNotification({
      user: req.user._id,
      title: "Profile photo updated",
      message: "Your new profile photo is now visible on your public portfolio.",
      type: "success",
      link: "/profile"
    });

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

const addPdfSection = (doc, title) => {
  doc.moveDown(1).fontSize(14).fillColor("#111827").text(title);
  doc.moveDown(0.35).strokeColor("#d1d5db").moveTo(52, doc.y).lineTo(543, doc.y).stroke();
  doc.moveDown(0.5);
};

export const exportProfilePdf = async (req, res, next) => {
  try {
    const [skills, projects, certificates, goals] = await Promise.all([
      Skill.find({ user: req.user._id }).sort({ category: 1, name: 1 }),
      Project.find({ user: req.user._id, status: { $ne: "Archived" } }).sort({ featured: -1, createdAt: -1 }),
      Certificate.find({ user: req.user._id }).sort({ issueDate: -1 }),
      Goal.find({ user: req.user._id }).sort({ createdAt: -1 })
    ]);
    const doc = new PDFDocument({ size: "A4", margin: 52 });
    const fileName = `${req.user.publicSlug || "ramixaq-profile"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    doc.fontSize(25).fillColor("#111827").text(req.user.name);
    doc.fontSize(12).fillColor("#374151").text(req.user.headline || "Student professional");
    doc.fontSize(9).fillColor("#6b7280").text(
      [
        req.user.email,
        req.user.phone,
        req.user.location,
        req.user.github,
        req.user.linkedin,
        req.user.leetcode,
        req.user.portfolio || req.user.website
      ]
        .filter(Boolean)
        .join(" | ")
    );
    if (req.user.bio) doc.moveDown(0.8).fontSize(10).fillColor("#374151").text(req.user.bio);

    addPdfSection(doc, "Skills");
    doc.fontSize(10).fillColor("#374151").text(skills.map((skill) => `${skill.name} (${skill.level})`).join(", ") || "No skills added.");

    addPdfSection(doc, "Projects");
    projects.slice(0, 6).forEach((project) => {
      doc.fontSize(11).fillColor("#111827").text(project.title);
      doc.fontSize(9).fillColor("#4b5563").text(project.description);
      if (project.techStack.length) doc.fillColor("#6b7280").text(project.techStack.join(", "));
      doc.moveDown(0.5);
    });

    addPdfSection(doc, "Certificates");
    certificates.slice(0, 8).forEach((certificate) => {
      doc.fontSize(10).fillColor("#374151").text(`${certificate.title} - ${certificate.issuer}`);
    });

    addPdfSection(doc, "Career Goals");
    goals.slice(0, 5).forEach((goal) => {
      doc.fontSize(10).fillColor("#374151").text(`${goal.title} - ${goal.status}`);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
