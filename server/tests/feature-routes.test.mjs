import assert from "node:assert/strict";
import crypto from "node:crypto";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import Activity from "../src/models/Activity.js";
import Certificate from "../src/models/Certificate.js";
import Goal from "../src/models/Goal.js";
import Notification from "../src/models/Notification.js";
import Project from "../src/models/Project.js";
import ResumeAnalysis from "../src/models/ResumeAnalysis.js";
import Skill from "../src/models/Skill.js";
import User from "../src/models/User.js";

process.env.JWT_SECRET = "test-only-jwt-secret";
process.env.OTP_SECRET = "test-only-otp-secret";
process.env.NODE_ENV = "test";

const { default: app } = await import("../src/app.js");

const user = {
  _id: "507f1f77bcf86cd799439012",
  name: "Feature Test",
  email: "feature-test@example.com",
  headline: "Frontend student",
  bio: "",
  location: "Hyderabad",
  phone: "",
  avatarUrl: "",
  github: "",
  linkedin: "",
  leetcode: "",
  portfolio: "",
  website: "",
  publicSlug: "feature-test",
  emailVerified: true,
  role: "student",
  xp: 0,
  level: 1,
  badges: [],
  resumeData: {
    skills: ["JavaScript"],
    projects: [],
    experience: [],
    certifications: []
  },
  internshipPreferences: {
    desiredRole: "Frontend Intern",
    locationPreference: "Hyderabad",
    workMode: "Any",
    experienceLevel: "Entry Level"
  },
  save: async function save() {
    return this;
  }
};

const skills = [{ _id: "skill-1", name: "JavaScript", level: "Intermediate" }];
const projects = [
  {
    _id: "project-1",
    title: "React Dashboard",
    description: "Responsive dashboard using APIs",
    techStack: ["React", "JavaScript"],
    status: "Completed"
  }
];
const certificates = [{ _id: "certificate-1", title: "Frontend Development", issuer: "Test Academy" }];

const query = (value) => ({
  select: async () => value,
  sort() {
    return this;
  },
  limit() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  }
});

const makePdf = () =>
  new Promise((resolve) => {
    const document = new PDFDocument();
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.fontSize(16).text("Feature Test");
    document.fontSize(10).text("feature-test@example.com | +91 9876543210");
    document.text("https://github.com/feature-test");
    document.text("https://linkedin.com/in/feature-test");
    document.text("https://leetcode.com/u/feature-test");
    document.moveDown().text("Skills");
    document.text("JavaScript, React, Node.js, MongoDB");
    document.moveDown().text("Education");
    document.text("B.Tech Computer Science - Test University");
    document.moveDown().text("Projects");
    document.text("Career dashboard built with React and Node.js");
    document.moveDown().text("Experience");
    document.text("Software development volunteer");
    document.moveDown().text("Certifications");
    document.text("Frontend Development Certificate");
    document.end();
  });

let server;
let baseUrl;
let token;

before(async () => {
  User.findOne = () => query(user);
  User.findById = () => query(user);
  User.findByIdAndUpdate = async (id, updates) => {
    Object.assign(user, updates);
    return user;
  };
  User.exists = async () => false;
  Skill.find = () => query(skills);
  Skill.insertMany = async (items) => {
    const created = items.map((item, index) => ({ _id: `imported-${index}`, ...item }));
    skills.push(...created);
    return created;
  };
  Project.find = () => query(projects);
  Certificate.find = () => query(certificates);
  Goal.find = () => query([]);
  ResumeAnalysis.create = async (payload) => ({ _id: "analysis-1", ...payload });
  Activity.create = async () => ({});
  Notification.create = async () => ({});

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("OTP send stores a hashed expiring code without returning it", async () => {
  user.loginOtpLastSentAt = undefined;
  const response = await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.match(data.message, /login code has been sent/);
  assert.match(user.loginOtpHash, /^[a-f0-9]{64}$/);
  assert.ok(user.loginOtpExpires > new Date());
  assert.equal(data.otp, undefined);
});

test("OTP verify returns the standard JWT session", async () => {
  const otp = "123456";
  user.loginOtpHash = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${user.email}:${otp}`)
    .digest("hex");
  user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.loginOtpAttempts = 0;

  const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, otp })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(data.token);
  assert.equal(data.user.email, user.email);
  assert.equal(user.loginOtpHash, undefined);
});

test("profile integrations validate and return connected status", async () => {
  const response = await fetch(`${baseUrl}/api/auth/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      github: "https://github.com/feature-test",
      linkedin: "https://linkedin.com/in/feature-test",
      leetcode: "https://leetcode.com/u/feature-test",
      portfolio: "https://portfolio.example.com"
    })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(data.user.integrations, {
    linkedin: true,
    github: true,
    leetcode: true,
    portfolio: true
  });
});

test("public portfolio excludes private resume and contact fields", async () => {
  const response = await fetch(`${baseUrl}/api/public/portfolio/${user.publicSlug}`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.user.resumeData, undefined);
  assert.equal(data.user.phone, undefined);
  assert.equal(data.user.email, undefined);
  assert.equal(data.user.github, "https://github.com/feature-test");
  assert.equal(data.user.leetcode, "https://leetcode.com/u/feature-test");
});

test("generated portfolio HTML includes validated profile integrations", async () => {
  const response = await fetch(`${baseUrl}/api/portfolio/generate`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.match(data.html, /GitHub/);
  assert.match(data.html, /LinkedIn/);
  assert.match(data.html, /LeetCode/);
  assert.match(data.html, /Portfolio/);
  assert.doesNotMatch(data.html, /loginOtpHash|resumeData/);
});

test("internship search returns provider-shaped mock results", async () => {
  const response = await fetch(
    `${baseUrl}/api/internships/search?role=Frontend%20Intern&location=Bengaluru&remoteType=Any`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.source, "mock-provider");
  assert.ok(data.results.length >= 1);
  assert.ok(data.results[0].matchScore >= 0);
  assert.ok(data.results[0].requiredSkills.length);
  assert.ok(data.results[0].applyLink);
});

test("internship match scores profile, resume, project, and certificate data", async () => {
  const response = await fetch(`${baseUrl}/api/internships/match`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      desiredRole: "Frontend Intern",
      locationPreference: "Hyderabad",
      workMode: "Any",
      experienceLevel: "Entry Level",
      skills: ["React", "CSS"]
    })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(data.applicationReadinessScore >= 0);
  assert.ok(data.recommendations.length >= 1);
  assert.ok(data.recommendations[0].matchScore >= 0);
  assert.ok(Array.isArray(data.recommendations[0].whyMatches));
  assert.ok(Array.isArray(data.recommendations[0].suggestedImprovements));
});

test("resume upload accepts a real PDF and updates the profile", async () => {
  const pdf = await makePdf();
  const form = new FormData();
  form.append("resume", new Blob([pdf], { type: "application/pdf" }), "feature-test-resume.pdf");
  form.append("targetRole", "Frontend Intern");

  const response = await fetch(`${baseUrl}/api/resume/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const data = await response.json();

  assert.equal(response.status, 201);
  assert.equal(data.message, "Resume parsed and profile updated");
  assert.ok(data.extracted.skills.includes("React"));
  assert.equal(data.extracted.github, "https://github.com/feature-test");
  assert.equal(data.extracted.linkedin, "https://linkedin.com/in/feature-test");
  assert.equal(data.extracted.leetcode, "https://leetcode.com/u/feature-test");
  assert.equal(data.user.resumeData.fileName, "feature-test-resume.pdf");
});
