export const ROLE_SKILL_MAP = {
  "MERN Stack Intern": [
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "Mongoose",
    "REST API",
    "JWT",
    "Git",
    "Tailwind CSS",
    "Deployment"
  ],
  "Frontend Intern": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Responsive Design",
    "Tailwind CSS",
    "Accessibility",
    "API Integration",
    "Git",
    "Testing"
  ],
  "Backend Intern": [
    "Node.js",
    "Express",
    "MongoDB",
    "Mongoose",
    "REST API",
    "Authentication",
    "JWT",
    "Error Handling",
    "Testing",
    "Deployment"
  ],
  "AI Product Intern": [
    "Python",
    "Prompt Engineering",
    "APIs",
    "Data Analysis",
    "JavaScript",
    "React",
    "Product Thinking",
    "Documentation",
    "Deployment"
  ],
  "Data Analyst Intern": [
    "Excel",
    "SQL",
    "Python",
    "Data Visualization",
    "Statistics",
    "Power BI",
    "Tableau",
    "Communication",
    "Git"
  ]
};

export const KNOWN_SKILLS = Array.from(
  new Set([
    ...Object.values(ROLE_SKILL_MAP).flat(),
    "TypeScript",
    "Redux",
    "Next.js",
    "GraphQL",
    "Docker",
    "AWS",
    "Firebase",
    "PostgreSQL",
    "MySQL",
    "Java",
    "C++",
    "DSA",
    "Machine Learning",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Figma",
    "Agile",
    "CI/CD"
  ])
);

const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getRequiredSkills = (targetRole = "MERN Stack Intern") => {
  const exact = ROLE_SKILL_MAP[targetRole];
  if (exact) return exact;

  const normalizedRole = normalize(targetRole);
  const match = Object.keys(ROLE_SKILL_MAP).find((role) => normalizedRole.includes(normalize(role).replace("intern", "")));
  return ROLE_SKILL_MAP[match] || ROLE_SKILL_MAP["MERN Stack Intern"];
};

export const extractSkillsFromText = (text = "") => {
  const normalizedText = normalize(text);
  return KNOWN_SKILLS.filter((skill) => normalizedText.includes(normalize(skill)));
};

export const compareSkillsToRole = (skills = [], targetRole = "MERN Stack Intern") => {
  const current = new Set(skills.map((skill) => normalize(skill.name || skill)));
  const required = getRequiredSkills(targetRole);
  const matchedSkills = required.filter((skill) => current.has(normalize(skill)));
  const missingSkills = required.filter((skill) => !current.has(normalize(skill)));
  const matchScore = Math.round((matchedSkills.length / required.length) * 100);

  return {
    targetRole,
    requiredSkills: required,
    matchedSkills,
    missingSkills,
    matchScore,
    recommendations: missingSkills.slice(0, 6).map((skill, index) => ({
      skill,
      priority: index < 2 ? "High" : index < 4 ? "Medium" : "Low",
      action: `Build one small project or certificate module using ${skill}.`
    }))
  };
};

export const calculateAtsScore = ({ text = "", extractedSkills = [], missingSkills = [], targetRole = "MERN Stack Intern" }) => {
  const required = getRequiredSkills(targetRole);
  const lowerText = text.toLowerCase();
  const sections = ["education", "experience", "projects", "skills"].filter((section) => lowerText.includes(section));
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{8,}\d)/.test(text);
  const hasLinks = /(github|linkedin|portfolio|https?:\/\/)/i.test(text);
  const skillCoverage = Math.round(((required.length - missingSkills.length) / required.length) * 45);
  const sectionScore = Math.min(sections.length * 8, 32);
  const contactScore = [hasEmail, hasPhone, hasLinks].filter(Boolean).length * 5;
  const densityScore = extractedSkills.length >= 8 ? 8 : extractedSkills.length >= 5 ? 5 : 2;

  return Math.min(100, skillCoverage + sectionScore + contactScore + densityScore);
};

export const buildResumeSuggestions = ({ atsScore, missingSkills = [], extractedSkills = [] }) => {
  const suggestions = [];

  if (atsScore < 70) suggestions.push("Add clearer Skills, Projects, Education, and Experience sections for ATS parsing.");
  if (missingSkills.length) suggestions.push(`Add evidence for: ${missingSkills.slice(0, 5).join(", ")}.`);
  if (extractedSkills.length < 6) suggestions.push("Add a compact technical skills section grouped by frontend, backend, database, and tools.");
  suggestions.push("Quantify project impact with metrics, users, performance gains, or deployment outcomes.");
  suggestions.push("Include GitHub, LinkedIn, and portfolio links near your contact details.");

  return suggestions;
};

export const INTERNSHIP_LIBRARY = [
  {
    title: "MERN Stack Developer Intern",
    targetRole: "MERN Stack Intern",
    company: "CloudNova Labs",
    location: "Remote",
    mode: "Remote",
    requiredSkills: ROLE_SKILL_MAP["MERN Stack Intern"],
    focus: "Build dashboards, APIs, and deployment-ready product modules."
  },
  {
    title: "Frontend Engineering Intern",
    targetRole: "Frontend Intern",
    company: "PixelForge Studio",
    location: "Bengaluru",
    mode: "Hybrid",
    requiredSkills: ROLE_SKILL_MAP["Frontend Intern"],
    focus: "Create responsive UI systems and integrate production APIs."
  },
  {
    title: "Backend API Intern",
    targetRole: "Backend Intern",
    company: "NodeWorks Systems",
    location: "Hyderabad",
    mode: "On-site",
    requiredSkills: ROLE_SKILL_MAP["Backend Intern"],
    focus: "Design secure REST APIs, database schemas, and auth workflows."
  },
  {
    title: "AI Product Intern",
    targetRole: "AI Product Intern",
    company: "PromptOps AI",
    location: "Remote",
    mode: "Remote",
    requiredSkills: ROLE_SKILL_MAP["AI Product Intern"],
    focus: "Prototype AI workflows and write product-ready documentation."
  },
  {
    title: "Data Analyst Intern",
    targetRole: "Data Analyst Intern",
    company: "InsightGrid Analytics",
    location: "Pune",
    mode: "Hybrid",
    requiredSkills: ROLE_SKILL_MAP["Data Analyst Intern"],
    focus: "Analyze datasets, build reports, and communicate insights."
  }
];

export const recommendInternships = (skills = []) =>
  INTERNSHIP_LIBRARY.map((internship) => {
    const comparison = compareSkillsToRole(skills, internship.targetRole);
    const current = new Set(skills.map((skill) => normalize(skill.name || skill)));
    const matchedSkills = internship.requiredSkills.filter((skill) => current.has(normalize(skill)));
    const missingSkills = internship.requiredSkills.filter((skill) => !current.has(normalize(skill)));

    return {
      ...internship,
      matchScore: Math.round((matchedSkills.length / internship.requiredSkills.length) * 100),
      matchedSkills,
      missingSkills: missingSkills.slice(0, 5),
      nextStep: comparison.recommendations[0]?.action || "Apply with your strongest portfolio project."
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

export const calculateReadinessScore = ({ skills = [], projects = [], certificates = [], goals = [], user = {} }) => {
  const completedProjects = projects.filter((project) => project.status === "Completed").length;
  const advancedSkills = skills.filter((skill) => skill.level === "Advanced").length;
  const inProgressGoals = goals.filter((goal) => goal.status !== "Completed").length;
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const profileFields = ["headline", "bio", "location", "github", "linkedin"];
  const profileCompletion = profileFields.filter((field) => Boolean(user[field])).length / profileFields.length;

  return Math.min(
    Math.min(skills.length * 4 + advancedSkills * 2, 30) +
      Math.min(projects.length * 6 + completedProjects * 4, 30) +
      Math.min(certificates.length * 5, 15) +
      Math.min(completedGoals * 5 + inProgressGoals * 2, 10) +
      Math.round(profileCompletion * 15),
    100
  );
};

export const calculateAchievements = ({ skills = [], projects = [], certificates = [], goals = [], resumeAnalyses = [], user = {} }) => {
  const completedProjects = projects.filter((project) => project.status === "Completed").length;
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const profileComplete = ["bio", "github", "linkedin"].every((field) => Boolean(user[field]));
  const xp =
    skills.length * 40 +
    completedProjects * 140 +
    certificates.length * 90 +
    completedGoals * 110 +
    resumeAnalyses.length * 100 +
    (profileComplete ? 150 : 0);
  const level = Math.max(1, Math.floor(xp / 300) + 1);

  const badges = [
    skills.length >= 5 ? { name: "Skill Builder", description: "Added 5 or more skills" } : null,
    completedProjects >= 2 ? { name: "Portfolio Maker", description: "Completed 2 portfolio projects" } : null,
    certificates.length >= 1 ? { name: "Credential Collector", description: "Added a certificate" } : null,
    resumeAnalyses.length >= 1 ? { name: "ATS Ready", description: "Analyzed a resume" } : null,
    completedGoals >= 1 ? { name: "Goal Finisher", description: "Completed an internship goal" } : null,
    profileComplete ? { name: "Public Signal", description: "Completed public profile links and bio" } : null
  ].filter(Boolean);

  return {
    xp,
    level,
    nextLevelXp: level * 300,
    progressToNextLevel: Math.round(((xp % 300) / 300) * 100),
    badges
  };
};
