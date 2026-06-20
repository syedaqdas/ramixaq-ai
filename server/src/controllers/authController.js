import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import { sendOtpEmail, sendPasswordResetEmail, sendVerificationEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";
import { integrationStatuses, normalizeProfileUrl, sanitizeText } from "../utils/profileLinks.js";
import { createUniqueSlug, normalizeSlug } from "../utils/slug.js";

const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to server/.env");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  headline: user.headline,
  bio: user.bio,
  location: user.location,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  github: user.github,
  linkedin: user.linkedin,
  leetcode: user.leetcode,
  portfolio: user.portfolio || user.website,
  website: user.website,
  resumeData: user.resumeData,
  internshipPreferences: user.internshipPreferences,
  integrations: integrationStatuses(user),
  publicSlug: user.publicSlug,
  emailVerified: user.emailVerified !== false,
  role: user.role,
  xp: user.xp,
  level: user.level,
  badges: user.badges
});

const createSecureToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const getOtpSecret = () => {
  const secret = process.env.OTP_SECRET || (process.env.NODE_ENV !== "production" ? process.env.JWT_SECRET : "");
  if (!secret) throw new Error("OTP_SECRET is missing. Add it to the backend environment");
  return secret;
};
const hashOtp = (email, otp) =>
  crypto.createHmac("sha256", getOtpSecret()).update(`${email.toLowerCase()}:${otp}`).digest("hex");

const issueVerificationToken = async (user) => {
  const token = createSecureToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  const sent = await sendVerificationEmail({ user, token });
  return { sent, token };
};

export const register = async (req, res, next) => {
  try {
    const name = sanitizeText(req.body.name, 80);
    const email = sanitizeText(req.body.email, 254).toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const verificationToken = createSecureToken();
    const publicSlug = await createUniqueSlug(name);
    const user = await User.create({
      name,
      email,
      password,
      publicSlug,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    const verificationSent = await sendVerificationEmail({ user, token: verificationToken });
    await createNotification({
      user: user._id,
      title: "Welcome to Ramixaq AI",
      message: "Complete your profile and add your skills to unlock personalized career intelligence.",
      type: "success",
      link: "/profile"
    });
    await logActivity({
      user: user._id,
      type: "auth.register",
      message: `${user.name} registered`,
      ip: req.ip
    });

    res.status(201).json({
      user: publicUser(user),
      token: createToken(user._id),
      verificationSent
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = sanitizeText(req.body.email, 254).toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.publicSlug) {
      user.publicSlug = await createUniqueSlug(user.name, user._id);
      await user.save({ validateBeforeSave: false });
    }

    await logActivity({
      user: user._id,
      type: "auth.login",
      message: `${user.name} logged in`,
      ip: req.ip
    });

    res.json({
      user: publicUser(user),
      token: createToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    let user = req.user;
    if (!user.publicSlug) {
      user = await User.findByIdAndUpdate(
        user._id,
        { publicSlug: await createUniqueSlug(user.name, user._id) },
        { new: true }
      );
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const textFields = ["name", "headline", "bio", "location", "phone"];
    const linkFields = ["github", "linkedin", "leetcode", "portfolio"];
    const updates = {};

    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const maxLength = field === "bio" ? 500 : field === "phone" ? 30 : 120;
        updates[field] = sanitizeText(req.body[field], maxLength);
      }
    });

    for (const field of linkFields) {
      if (req.body[field] !== undefined) {
        updates[field] = normalizeProfileUrl(req.body[field], field);
      }
    }

    if (req.body.website !== undefined && req.body.portfolio === undefined) {
      updates.portfolio = normalizeProfileUrl(req.body.website, "portfolio");
    }
    if (updates.portfolio !== undefined) updates.website = updates.portfolio;

    if (req.body.internshipPreferences && typeof req.body.internshipPreferences === "object") {
      const desiredRole = sanitizeText(req.body.internshipPreferences.desiredRole, 100);
      const locationPreference = sanitizeText(req.body.internshipPreferences.locationPreference, 100);
      const workMode = ["Any", "Remote", "Hybrid", "On-site"].includes(req.body.internshipPreferences.workMode)
        ? req.body.internshipPreferences.workMode
        : "Any";
      const experienceLevel = ["Beginner", "Entry Level", "Intermediate"].includes(
        req.body.internshipPreferences.experienceLevel
      )
        ? req.body.internshipPreferences.experienceLevel
        : "Entry Level";
      updates.internshipPreferences = { desiredRole, locationPreference, workMode, experienceLevel };
    }

    if (req.body.publicSlug !== undefined) {
      const requestedSlug = normalizeSlug(req.body.publicSlug);
      if (!requestedSlug) {
        return res.status(400).json({ message: "Portfolio URL must contain letters or numbers" });
      }

      const existingSlug = await User.exists({
        publicSlug: requestedSlug,
        _id: { $ne: req.user._id }
      });
      if (existingSlug) {
        return res.status(409).json({ message: "That portfolio URL is already taken" });
      }
      updates.publicSlug = requestedSlug;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    await logActivity({
      user: req.user._id,
      type: "profile.update",
      message: "Profile updated",
      metadata: { fields: Object.keys(updates) },
      ip: req.ip
    });

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const sendLoginOtp = async (req, res, next) => {
  try {
    const email = sanitizeText(req.body.email, 254).toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const user = await User.findOne({ email }).select(
      "+loginOtpHash +loginOtpExpires +loginOtpAttempts +loginOtpLastSentAt"
    );
    const genericMessage = "If an account exists for that email, a login code has been sent";
    if (!user) return res.json({ message: genericMessage });

    if (user.loginOtpLastSentAt && Date.now() - user.loginOtpLastSentAt.getTime() < 60 * 1000) {
      return res.json({ message: genericMessage, expiresInSeconds: 600 });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    user.loginOtpHash = hashOtp(email, otp);
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.loginOtpAttempts = 0;
    user.loginOtpLastSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    const sent = await sendOtpEmail({ user, otp });
    if (!sent && process.env.NODE_ENV === "production") {
      user.loginOtpHash = undefined;
      user.loginOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.json({ message: genericMessage, expiresInSeconds: 600 });
    }
    if (!sent && process.env.NODE_ENV === "development") {
      console.info(`Ramixaq AI development OTP for ${email}: ${otp}`);
    }

    res.json({ message: genericMessage, expiresInSeconds: 600 });
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const email = sanitizeText(req.body.email, 254).toLowerCase();
    const otp = sanitizeText(req.body.otp, 6);
    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Email and a 6 digit OTP are required" });
    }

    const user = await User.findOne({ email }).select(
      "+loginOtpHash +loginOtpExpires +loginOtpAttempts +loginOtpLastSentAt"
    );
    if (!user?.loginOtpHash || !user.loginOtpExpires || user.loginOtpExpires.getTime() <= Date.now()) {
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }
    if ((user.loginOtpAttempts || 0) >= 5) {
      return res.status(429).json({ message: "Too many incorrect attempts. Request a new OTP" });
    }

    const expected = Buffer.from(user.loginOtpHash, "hex");
    const received = Buffer.from(hashOtp(email, otp), "hex");
    const isValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!isValid) {
      user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ message: "OTP is invalid or expired" });
    }

    user.loginOtpHash = undefined;
    user.loginOtpExpires = undefined;
    user.loginOtpAttempts = 0;
    user.loginOtpLastSentAt = undefined;
    if (!user.publicSlug) user.publicSlug = await createUniqueSlug(user.name, user._id);
    await user.save({ validateBeforeSave: false });

    await logActivity({
      user: user._id,
      type: "auth.otp_login",
      message: `${user.name} logged in with OTP`,
      ip: req.ip
    });

    res.json({ user: publicUser(user), token: createToken(user._id) });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+emailVerificationToken +emailVerificationExpires");

    if (user.emailVerified) {
      return res.json({ message: "Email is already verified" });
    }

    const { sent, token } = await issueVerificationToken(user);
    res.json({
      message: sent ? "Verification email sent" : "SMTP is not configured; verification email could not be sent",
      ...(process.env.NODE_ENV !== "production" && !sent ? { verificationToken: token } : {})
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() }
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or expired" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    await createNotification({
      user: user._id,
      title: "Email verified",
      message: "Your Ramixaq AI account email has been verified.",
      type: "success",
      link: "/profile"
    });

    res.json({ message: "Email verified successfully", user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });

    if (user) {
      const token = createSecureToken();
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      await sendPasswordResetEmail({ user, token });
    }

    res.json({ message: "If an account exists for that email, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: "A valid token and password of at least 6 characters are required" });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ message: "Password reset link is invalid or expired" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await createNotification({
      user: user._id,
      title: "Password updated",
      message: "Your account password was reset successfully.",
      type: "success"
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
