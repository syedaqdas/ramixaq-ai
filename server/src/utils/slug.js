import User from "../models/User.js";

export const normalizeSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const createUniqueSlug = async (value, excludeUserId) => {
  const base = normalizeSlug(value) || "student";
  let candidate = base;
  let suffix = 1;

  while (
    await User.exists({
      publicSlug: candidate,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {})
    })
  ) {
    suffix += 1;
    candidate = `${base.slice(0, 54)}-${suffix}`;
  }

  return candidate;
};
