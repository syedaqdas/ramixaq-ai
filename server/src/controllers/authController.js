import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logActivity } from "../utils/activity.js";

const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to server/.env");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const publicUser = (user) => ({
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
  role: user.role,
  xp: user.xp,
  level: user.level,
  badges: user.badges
});

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

    const user = await User.create({ name, email, password });
    await logActivity({
      user: user._id,
      type: "auth.register",
      message: `${user.name} registered`,
      ip: req.ip
    });

    res.status(201).json({
      user: publicUser(user),
      token: createToken(user._id)
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

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "headline", "bio", "location", "avatarUrl", "github", "linkedin", "website"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

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
