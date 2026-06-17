import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Skill from "../models/Skill.js";
import { calculateAchievements } from "../utils/careerIntelligence.js";

export const getAchievements = async (req, res, next) => {
  try {
    const [skills, projects, certificates, goals, resumeAnalyses] = await Promise.all([
      Skill.find({ user: req.user._id }),
      Project.find({ user: req.user._id }),
      Certificate.find({ user: req.user._id }),
      Goal.find({ user: req.user._id }),
      ResumeAnalysis.find({ user: req.user._id })
    ]);

    const achievements = calculateAchievements({
      skills,
      projects,
      certificates,
      goals,
      resumeAnalyses,
      user: req.user
    });

    res.json(achievements);
  } catch (error) {
    next(error);
  }
};

