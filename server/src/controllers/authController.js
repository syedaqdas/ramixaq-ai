import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";
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
  avatarUrl: user.avatarUrl,
  github: user.github,
  linkedin: user.linkedin,
  website: user.website,
  publicSlug: user.publicSlug,
  emailVerified: user.emailVerified !== false,
  role: user.role,
  xp: user.xp,
  level: user.level,
  badges: user.badges
});

const createSecureToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
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
    const { email, password } = req.body;

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
    const allowedFields = ["name", "headline", "bio", "location", "github", "linkedin", "website"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

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
