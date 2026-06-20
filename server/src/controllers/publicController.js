import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -email");

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const [skills, projects, certificates, goals] = await Promise.all([
      Skill.find({ user: user._id }).sort({ category: 1, name: 1 }),
      Project.find({ user: user._id, status: { $ne: "Archived" } }).sort({ featured: -1, createdAt: -1 }),
      Certificate.find({ user: user._id }).sort({ issueDate: -1 }),
      Goal.find({ user: user._id }).sort({ createdAt: -1 })
    ]);

    res.json({
      user,
      skills,
      projects,
      certificates,
      goals: goals.filter((goal) => goal.status !== "Not Started")
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicPortfolio = async (req, res, next) => {
  try {
    const user = await User.findOne({ publicSlug: req.params.slug.toLowerCase() }).select(
      "-password -email -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const [skills, projects, certificates, goals] = await Promise.all([
      Skill.find({ user: user._id }).sort({ category: 1, name: 1 }),
      Project.find({ user: user._id, status: { $ne: "Archived" } }).sort({ featured: -1, createdAt: -1 }),
      Certificate.find({ user: user._id }).sort({ issueDate: -1 }),
      Goal.find({ user: user._id, status: { $ne: "Not Started" } }).sort({ createdAt: -1 })
    ]);

    res.json({ user, skills, projects, certificates, goals });
  } catch (error) {
    next(error);
  }
};
