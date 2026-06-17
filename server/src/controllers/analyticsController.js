import Certificate from "../models/Certificate.js";
import Goal from "../models/Goal.js";
import Project from "../models/Project.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Skill from "../models/Skill.js";
import { calculateReadinessScore } from "../utils/careerIntelligence.js";

const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

const makeMonthlySeries = (items, label) => {
  const buckets = {};
  items.forEach((item) => {
    const key = monthKey(item.createdAt);
    buckets[key] = (buckets[key] || 0) + 1;
  });

  let running = 0;
  return Object.keys(buckets)
    .sort()
    .map((month) => {
      running += buckets[month];
      return { month, [label]: running, added: buckets[month] };
    });
};

export const getAnalytics = async (req, res, next) => {
  try {
    const [skills, projects, certificates, goals, resumeAnalyses] = await Promise.all([
      Skill.find({ user: req.user._id }).sort({ createdAt: 1 }),
      Project.find({ user: req.user._id }).sort({ createdAt: 1 }),
      Certificate.find({ user: req.user._id }).sort({ createdAt: 1 }),
      Goal.find({ user: req.user._id }).sort({ createdAt: 1 }),
      ResumeAnalysis.find({ user: req.user._id }).sort({ createdAt: 1 })
    ]);

    const skillGrowth = makeMonthlySeries(skills, "skills");
    const readinessMonths = Array.from(
      new Set([...skills, ...projects, ...certificates, ...goals].map((item) => monthKey(item.createdAt)))
    ).sort();
    const readinessTrend = readinessMonths.map((month) => {
      const until = new Date(`${month}-31T23:59:59.999Z`);
      return {
        month,
        score: calculateReadinessScore({
          skills: skills.filter((item) => item.createdAt <= until),
          projects: projects.filter((item) => item.createdAt <= until),
          certificates: certificates.filter((item) => item.createdAt <= until),
          goals: goals.filter((item) => item.createdAt <= until),
          user: req.user
        })
      };
    });

    const projectStatus = ["Planned", "In Progress", "Completed", "Archived"].map((status) => ({
      status,
      count: projects.filter((project) => project.status === status).length
    }));

    const projectCompletion = makeMonthlySeries(
      projects.filter((project) => project.status === "Completed"),
      "completed"
    );

    const resumeScores = resumeAnalyses.map((analysis) => ({
      date: new Date(analysis.createdAt).toISOString().slice(0, 10),
      atsScore: analysis.atsScore
    }));

    res.json({
      skillGrowth,
      readinessTrend,
      projectStatus,
      projectCompletion,
      resumeScores,
      totals: {
        skills: skills.length,
        projects: projects.length,
        completedProjects: projects.filter((project) => project.status === "Completed").length,
        certificates: certificates.length,
        goals: goals.length,
        resumeAnalyses: resumeAnalyses.length
      }
    });
  } catch (error) {
    next(error);
  }
};
