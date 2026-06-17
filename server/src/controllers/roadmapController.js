import Skill from "../models/Skill.js";

const TRACKS = [
  {
    role: "MERN Stack Intern",
    required: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "REST API", "JWT", "Git", "Tailwind CSS", "Deployment"]
  },
  {
    role: "Frontend Intern",
    required: ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "Tailwind CSS", "Accessibility", "Git", "API Integration", "Testing"]
  },
  {
    role: "Backend Intern",
    required: ["Node.js", "Express", "MongoDB", "Mongoose", "REST API", "Authentication", "JWT", "Error Handling", "Testing", "Deployment"]
  },
  {
    role: "AI Product Intern",
    required: ["Python", "Prompt Engineering", "APIs", "Data Analysis", "JavaScript", "React", "Product Thinking", "Git", "Documentation", "Deployment"]
  }
];

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getRoadmap = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id });
    const current = new Set(skills.map((skill) => normalize(skill.name)));

    const tracks = TRACKS.map((track) => {
      const missing = track.required.filter((skill) => !current.has(normalize(skill)));
      const match = Math.round(((track.required.length - missing.length) / track.required.length) * 100);

      return {
        role: track.role,
        match,
        missing,
        nextSkills: missing.slice(0, 5)
      };
    }).sort((a, b) => b.match - a.match);

    res.json({
      currentSkills: skills.map((skill) => skill.name),
      recommendedTrack: tracks[0],
      tracks
    });
  } catch (error) {
    next(error);
  }
};

