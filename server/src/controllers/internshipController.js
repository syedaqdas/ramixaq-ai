import Certificate from "../models/Certificate.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import { sanitizeText } from "../utils/profileLinks.js";
import { scoreInternship, searchInternships } from "../services/internshipProvider.js";

const validModes = ["Any", "Remote", "Hybrid", "On-site"];
const validExperience = ["Beginner", "Entry Level", "Intermediate"];

const readCriteria = (input = {}, fallback = {}) => ({
  desiredRole: sanitizeText(input.desiredRole || input.role || fallback.desiredRole || "", 100),
  locationPreference: sanitizeText(
    input.locationPreference || input.location || fallback.locationPreference || "",
    100
  ),
  workMode: validModes.includes(input.workMode || input.remoteType)
    ? input.workMode || input.remoteType
    : fallback.workMode || "Any",
  experienceLevel: validExperience.includes(input.experienceLevel)
    ? input.experienceLevel
    : fallback.experienceLevel || "Entry Level"
});

export const search = async (req, res, next) => {
  try {
    const criteria = readCriteria(req.query, req.user.internshipPreferences);
    const [skills, projects, certificates] = await Promise.all([
      Skill.find({ user: req.user._id }),
      Project.find({ user: req.user._id, status: { $ne: "Archived" } }),
      Certificate.find({ user: req.user._id })
    ]);
    const results = searchInternships({
      role: criteria.desiredRole,
      location: criteria.locationPreference,
      remoteType: criteria.workMode
    })
      .map((internship) =>
        scoreInternship({
          internship,
          skills: [...skills, ...(req.user.resumeData?.skills || []).map((name) => ({ name }))],
          projects,
          certificates,
          preferences: criteria,
          resumeData: req.user.resumeData
        })
      )
      .sort((a, b) => b.matchScore - a.matchScore);
    res.json({ criteria, results, source: "mock-provider", count: results.length });
  } catch (error) {
    next(error);
  }
};

export const match = async (req, res, next) => {
  try {
    const [skills, projects, certificates, user] = await Promise.all([
      Skill.find({ user: req.user._id }),
      Project.find({ user: req.user._id, status: { $ne: "Archived" } }),
      Certificate.find({ user: req.user._id }),
      User.findById(req.user._id)
    ]);
    const criteria = readCriteria(req.body, user.internshipPreferences);
    const manualSkills = Array.isArray(req.body.skills)
      ? req.body.skills.map((skill) => sanitizeText(skill, 60)).filter(Boolean)
      : [];
    const combinedSkills = [
      ...skills,
      ...(user.resumeData?.skills || []).map((name) => ({ name })),
      ...manualSkills.map((name) => ({ name }))
    ];
    const available = searchInternships({
      role: criteria.desiredRole,
      location: criteria.locationPreference,
      remoteType: criteria.workMode
    });
    const pool = available.length ? available : searchInternships();
    const recommendations = pool
      .map((internship) =>
        scoreInternship({
          internship,
          skills: combinedSkills,
          projects,
          certificates,
          preferences: criteria,
          resumeData: user.resumeData
        })
      )
      .sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = recommendations.slice(0, 5);
    const readinessScore = topMatches.length
      ? Math.round(topMatches.reduce((total, item) => total + item.matchScore, 0) / topMatches.length)
      : 0;
    const bestRoles = Array.from(new Set(topMatches.map((item) => item.title))).slice(0, 3);

    await User.findByIdAndUpdate(req.user._id, { internshipPreferences: criteria }, { runValidators: true });
    await logActivity({
      user: req.user._id,
      type: "internship.match",
      message: "Internship matches generated",
      metadata: { desiredRole: criteria.desiredRole, readinessScore, results: topMatches.length },
      ip: req.ip
    });

    res.json({
      criteria,
      source: "mock-provider",
      applicationReadinessScore: readinessScore,
      bestRoles,
      recommendations: topMatches
    });
  } catch (error) {
    next(error);
  }
};
