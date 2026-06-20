import { extractSkillsFromText } from "./careerIntelligence.js";
import { normalizeProfileUrl, sanitizeText } from "./profileLinks.js";

const SECTION_ALIASES = {
  skills: ["skills", "technical skills", "core skills", "technologies"],
  education: ["education", "academic background", "academics"],
  projects: ["projects", "personal projects", "academic projects"],
  experience: ["experience", "work experience", "internships", "employment"],
  certifications: ["certifications", "certificates", "licenses"]
};

const allHeadings = Object.values(SECTION_ALIASES).flat();
const normalizeHeading = (line) => line.toLowerCase().replace(/[:|\-]/g, "").trim();

const splitLines = (text) =>
  String(text || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => sanitizeText(line, 300))
    .filter(Boolean);

const isHeading = (line) => allHeadings.includes(normalizeHeading(line));

const extractSection = (lines, key) => {
  const aliases = SECTION_ALIASES[key];
  const start = lines.findIndex((line) => aliases.includes(normalizeHeading(line)));
  if (start < 0) return [];

  const values = [];
  for (let index = start + 1; index < lines.length && values.length < 12; index += 1) {
    const line = lines[index];
    if (isHeading(line)) break;
    const cleaned = line.replace(/^[\u2022\-*|\d.)\s]+/, "").trim();
    if (cleaned.length >= 2) values.push(cleaned);
  }

  return values;
};

const extractUrl = (text, pattern, field) => {
  const match = String(text || "").match(pattern);
  if (!match) return "";

  try {
    return normalizeProfileUrl(match[0].replace(/[),.;]+$/, ""), field);
  } catch {
    return "";
  }
};

export const parseResumeText = (text = "", fileName = "") => {
  const lines = splitLines(text);
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0]?.toLowerCase() || "";
  const phone =
    text
      .match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,6}/)?.[0]
      ?.replace(/\s+/g, " ")
      .trim() || "";
  const name =
    lines.find(
      (line) =>
        line.length <= 80 &&
        /^[a-z .'-]+$/i.test(line) &&
        !isHeading(line) &&
        !line.includes("@") &&
        !/\d{4,}/.test(line)
    ) || "";

  const skillsSection = extractSection(lines, "skills")
    .flatMap((line) => line.split(/[,|/]/))
    .map((skill) => sanitizeText(skill, 60))
    .filter((skill) => skill.length > 1 && skill.length < 60);
  const skills = Array.from(new Set([...extractSkillsFromText(text), ...skillsSection])).slice(0, 40);

  return {
    fileName: sanitizeText(fileName, 160),
    parsedAt: new Date(),
    name,
    email,
    phone,
    skills,
    education: extractSection(lines, "education"),
    projects: extractSection(lines, "projects"),
    experience: extractSection(lines, "experience"),
    certifications: extractSection(lines, "certifications"),
    github: extractUrl(text, /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+/i, "github"),
    linkedin: extractUrl(text, /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_%.-]+/i, "linkedin"),
    leetcode: extractUrl(text, /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?[A-Za-z0-9_-]+/i, "leetcode"),
    textPreview: sanitizeText(text, 1800)
  };
};
