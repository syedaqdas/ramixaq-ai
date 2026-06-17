import pdfParse from "pdf-parse";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Skill from "../models/Skill.js";
import {
  buildResumeSuggestions,
  calculateAtsScore,
  compareSkillsToRole,
  extractSkillsFromText,
  recommendInternships
} from "../utils/careerIntelligence.js";
import { logActivity } from "../utils/activity.js";

export const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF resume is required" });
    }

    const targetRole = req.body.targetRole || "MERN Stack Intern";
    const parsed = await pdfParse(req.file.buffer);
    const text = parsed.text || "";
    const extractedSkills = extractSkillsFromText(text);
    const comparison = compareSkillsToRole(extractedSkills, targetRole);
    const atsScore = calculateAtsScore({
      text,
      extractedSkills,
      missingSkills: comparison.missingSkills,
      targetRole
    });
    const suggestions = buildResumeSuggestions({
      atsScore,
      missingSkills: comparison.missingSkills,
      extractedSkills
    });

    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      targetRole,
      extractedSkills,
      missingSkills: comparison.missingSkills,
      atsScore,
      suggestions,
      textPreview: text.slice(0, 1200)
    });

    await logActivity({
      user: req.user._id,
      type: "ai.resume_analyze",
      message: "Resume analyzed",
      metadata: { atsScore, targetRole, extractedSkills: extractedSkills.length },
      ip: req.ip
    });

    res.status(201).json({
      analysis,
      matchScore: comparison.matchScore,
      matchedSkills: comparison.matchedSkills,
      requiredSkills: comparison.requiredSkills
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeAnalyses = async (req, res, next) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(analyses);
  } catch (error) {
    next(error);
  }
};

export const analyzeSkillGap = async (req, res, next) => {
  try {
    const targetRole = req.body.targetRole || req.query.targetRole || "MERN Stack Intern";
    const skills = await Skill.find({ user: req.user._id });
    const analysis = compareSkillsToRole(skills, targetRole);

    await logActivity({
      user: req.user._id,
      type: "ai.skill_gap",
      message: "Skill gap analysis generated",
      metadata: { targetRole, matchScore: analysis.matchScore },
      ip: req.ip
    });

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

export const getInternshipRecommendations = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id });
    const recommendations = recommendInternships(skills);

    res.json({
      recommendations,
      topMatch: recommendations[0] || null
    });
  } catch (error) {
    next(error);
  }
};

