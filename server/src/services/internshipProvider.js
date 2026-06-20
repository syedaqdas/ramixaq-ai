import { internships } from "../data/internships.js";
import { sanitizeText } from "../utils/profileLinks.js";

const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const roleTokens = (value = "") =>
  sanitizeText(value, 100)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 2 && !["intern", "internship", "developer", "engineering"].includes(token));

export const searchInternships = ({ role = "", location = "", remoteType = "Any" } = {}) => {
  const roleQuery = normalize(sanitizeText(role, 100));
  const requestedTokens = roleTokens(role);
  const locationQuery = normalize(sanitizeText(location, 100));

  return internships.filter((internship) => {
    const roleMatch =
      !roleQuery ||
      normalize(internship.title).includes(roleQuery) ||
      roleQuery.includes(normalize(internship.title)) ||
      internship.requiredSkills.some((skill) => roleQuery.includes(normalize(skill))) ||
      requestedTokens.some(
        (token) =>
          internship.title.toLowerCase().includes(token) ||
          internship.requiredSkills.some((skill) => skill.toLowerCase().includes(token))
      );
    const locationMatch =
      !locationQuery ||
      normalize(internship.location).includes(locationQuery) ||
      internship.remoteType === "Remote";
    const modeMatch = !remoteType || remoteType === "Any" || internship.remoteType === remoteType;
    return roleMatch && locationMatch && modeMatch;
  });
};

export const scoreInternship = ({ internship, skills, projects, certificates, preferences, resumeData }) => {
  const normalizedSkills = new Set(skills.map((skill) => normalize(skill.name || skill)));
  const matchedSkills = internship.requiredSkills.filter((skill) => normalizedSkills.has(normalize(skill)));
  const missingSkills = internship.requiredSkills.filter((skill) => !normalizedSkills.has(normalize(skill)));
  const skillScore = Math.round((matchedSkills.length / internship.requiredSkills.length) * 55);
  const roleText = normalize(preferences.desiredRole);
  const roleScore =
    roleText && (normalize(internship.title).includes(roleText) || roleText.includes(normalize(internship.title)))
      ? 15
      : internship.requiredSkills.some((skill) => roleText.includes(normalize(skill)))
        ? 10
        : 4;
  const modeScore =
    preferences.workMode === "Any" || preferences.workMode === internship.remoteType ? 8 : 2;
  const locationScore =
    !preferences.locationPreference ||
    internship.remoteType === "Remote" ||
    normalize(internship.location).includes(normalize(preferences.locationPreference))
      ? 7
      : 1;
  const projectText = normalize(projects.map((project) => `${project.title} ${project.description} ${project.techStack}`).join(" "));
  const relevantProjectSkills = internship.requiredSkills.filter((skill) => projectText.includes(normalize(skill)));
  const projectScore = Math.min(10, relevantProjectSkills.length * 2 + Math.min(projects.length, 2));
  const credentialScore = Math.min(5, certificates.length * 2);
  const experienceItems = resumeData?.experience?.length || 0;
  const experienceScore = Math.min(5, experienceItems * 2 + (resumeData?.projects?.length ? 1 : 0));
  const matchScore = Math.min(
    100,
    skillScore + roleScore + modeScore + locationScore + projectScore + credentialScore + experienceScore
  );

  const whyMatches = [
    matchedSkills.length ? `Matches ${matchedSkills.length} required skills: ${matchedSkills.slice(0, 4).join(", ")}` : null,
    relevantProjectSkills.length ? "Existing projects demonstrate relevant technology experience" : null,
    preferences.workMode === "Any" || preferences.workMode === internship.remoteType
      ? `${internship.remoteType} preference aligns`
      : null,
    certificates.length ? "Relevant certificates strengthen application evidence" : null
  ].filter(Boolean);
  const suggestedImprovements = [
    ...missingSkills.slice(0, 4).map((skill) => `Build or document a project using ${skill}`),
    projects.length < 2 ? "Add at least two completed projects with measurable outcomes" : null,
    !resumeData?.experience?.length ? "Add internship, freelance, volunteer, or leadership experience" : null
  ].filter(Boolean);

  return {
    ...internship,
    matchScore,
    matchedSkills,
    missingSkills,
    whyMatches,
    suggestedImprovements
  };
};
