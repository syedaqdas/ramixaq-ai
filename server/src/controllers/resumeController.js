import PDFDocument from "pdfkit";
import pdfParse from "pdf-parse";
import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import {
  buildResumeSuggestions,
  calculateAtsScore,
  compareSkillsToRole
} from "../utils/careerIntelligence.js";
import { createNotification } from "../utils/notification.js";
import { parseResumeText } from "../utils/resumeParser.js";
import { publicUser } from "./authController.js";

const addSection = (doc, title) => {
  doc.moveDown(1.2).fontSize(15).fillColor("#111827").text(title).moveTo(doc.x, doc.y + 2).lineTo(540, doc.y + 2).strokeColor("#d1d5db").stroke();
  doc.moveDown(0.6).fillColor("#111827");
};

const isPdfBuffer = (buffer) => buffer?.subarray(0, 5).toString() === "%PDF-";

export const uploadAndParseResume = async (req, res, next) => {
  try {
    if (!req.file || !isPdfBuffer(req.file.buffer)) {
      return res.status(400).json({ message: "A valid PDF resume is required" });
    }

    const parsedPdf = await pdfParse(req.file.buffer);
    const text = parsedPdf.text || "";
    if (!text.trim()) {
      return res.status(422).json({ message: "The PDF does not contain readable text" });
    }

    const parsed = parseResumeText(text, req.file.originalname);
    const existingSkills = await Skill.find({ user: req.user._id }).select("name");
    const existingNames = new Set(existingSkills.map((skill) => skill.name.toLowerCase()));
    const newSkills = parsed.skills.filter((name) => !existingNames.has(name.toLowerCase()));

    if (newSkills.length) {
      await Skill.insertMany(
        newSkills.map((name) => ({
          user: req.user._id,
          name,
          category: "Technical",
          level: "Intermediate",
          priority: "Medium",
          notes: "Imported from resume"
        }))
      );
    }

    const profileUpdates = {
      resumeData: {
        fileName: parsed.fileName,
        parsedAt: parsed.parsedAt,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        skills: parsed.skills,
        education: parsed.education,
        projects: parsed.projects,
        experience: parsed.experience,
        certifications: parsed.certifications,
        textPreview: parsed.textPreview
      }
    };
    if (parsed.name) profileUpdates.name = parsed.name;
    if (parsed.phone) profileUpdates.phone = parsed.phone;
    if (parsed.github) profileUpdates.github = parsed.github;
    if (parsed.linkedin) profileUpdates.linkedin = parsed.linkedin;
    if (parsed.leetcode) profileUpdates.leetcode = parsed.leetcode;

    const user = await User.findByIdAndUpdate(req.user._id, profileUpdates, {
      new: true,
      runValidators: true
    });

    const targetRole = req.body.targetRole || user.internshipPreferences?.desiredRole || "MERN Stack Intern";
    const comparison = compareSkillsToRole(parsed.skills, targetRole);
    const atsScore = calculateAtsScore({
      text,
      extractedSkills: parsed.skills,
      missingSkills: comparison.missingSkills,
      targetRole
    });
    const suggestions = buildResumeSuggestions({
      atsScore,
      missingSkills: comparison.missingSkills,
      extractedSkills: parsed.skills
    });
    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      targetRole,
      extractedSkills: parsed.skills,
      missingSkills: comparison.missingSkills,
      atsScore,
      suggestions,
      textPreview: parsed.textPreview
    });

    await Promise.all([
      logActivity({
        user: req.user._id,
        type: "resume.profile_import",
        message: "Resume parsed and profile updated",
        metadata: { fileName: req.file.originalname, skillsAdded: newSkills.length, atsScore },
        ip: req.ip
      }),
      createNotification({
        user: req.user._id,
        title: "Resume imported",
        message: `${newSkills.length} new skills were added and your profile was updated.`,
        type: "success",
        link: "/resume/upload"
      })
    ]);

    res.status(201).json({
      message: "Resume parsed and profile updated",
      extracted: {
        ...parsed,
        newSkills
      },
      analysis,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
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
    doc.fontSize(11).fillColor("#4b5563").text(
      [req.user.email, req.user.phone, req.user.location, req.user.github, req.user.linkedin, req.user.leetcode]
        .filter(Boolean)
        .join(" | ")
    );
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
