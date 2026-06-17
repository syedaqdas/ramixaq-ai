import Activity from "../models/Activity.js";
import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";

export const getAdminSummary = async (req, res, next) => {
  try {
    const [users, skills, projects, certificates, goals, resumeAnalyses, activityCount, recentUsers, recentActivity] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      Project.countDocuments(),
      Certificate.countDocuments(),
      Goal.countDocuments(),
      ResumeAnalysis.countDocuments(),
      Activity.countDocuments(),
      User.find().select("-password").sort({ createdAt: -1 }).limit(8),
      Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(12)
    ]);

    res.json({
      totals: {
        users,
        skills,
        projects,
        certificates,
        goals,
        resumeAnalyses,
        activities: activityCount
      },
      recentUsers,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(50);
    res.json(activity);
  } catch (error) {
    next(error);
  }
};

