import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";

const scoreReadiness = ({ skills, projects, certificates, goals, user }) => {
  const completedProjects = projects.filter((project) => project.status === "Completed").length;
  const advancedSkills = skills.filter((skill) => skill.level === "Advanced").length;
  const inProgressGoals = goals.filter((goal) => goal.status !== "Completed").length;
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const profileFields = ["headline", "bio", "location", "github", "linkedin"];
  const profileCompletion = profileFields.filter((field) => Boolean(user[field])).length / profileFields.length;

  const skillScore = Math.min(skills.length * 4 + advancedSkills * 2, 30);
  const projectScore = Math.min(projects.length * 6 + completedProjects * 4, 30);
  const certificateScore = Math.min(certificates.length * 5, 15);
  const goalScore = Math.min(completedGoals * 5 + inProgressGoals * 2, 10);
  const profileScore = Math.round(profileCompletion * 15);

  return Math.min(skillScore + projectScore + certificateScore + goalScore + profileScore, 100);
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [skills, projects, certificates, goals] = await Promise.all([
      Skill.find({ user: req.user._id }).sort({ createdAt: -1 }),
      Project.find({ user: req.user._id }).sort({ createdAt: -1 }),
      Certificate.find({ user: req.user._id }).sort({ createdAt: -1 }),
      Goal.find({ user: req.user._id }).sort({ createdAt: -1 })
    ]);

    const score = scoreReadiness({ skills, projects, certificates, goals, user: req.user });
    const gaps = [];

    if (skills.length < 6) gaps.push("Add more role-specific skills");
    if (projects.filter((project) => project.status === "Completed").length < 2) gaps.push("Complete at least two portfolio projects");
    if (!req.user.github) gaps.push("Add your GitHub profile link");
    if (!req.user.linkedin) gaps.push("Add your LinkedIn profile link");
    if (certificates.length < 1) gaps.push("Add at least one relevant certificate");

    res.json({
      score,
      counts: {
        skills: skills.length,
        projects: projects.length,
        certificates: certificates.length,
        goals: goals.length
      },
      recent: {
        skills: skills.slice(0, 4),
        projects: projects.slice(0, 3),
        certificates: certificates.slice(0, 3),
        goals: goals.slice(0, 3)
      },
      gaps,
      strengths: [
        skills.length >= 6 ? "Skill base is taking shape" : null,
        projects.length >= 2 ? "Portfolio has multiple projects" : null,
        certificates.length >= 1 ? "Credentials are visible" : null,
        goals.some((goal) => goal.status === "In Progress") ? "Internship goals are active" : null
      ].filter(Boolean)
    });
  } catch (error) {
    next(error);
  }
};

