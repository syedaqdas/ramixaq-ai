import Activity from "../models/Activity.js";

export const logActivity = async ({ user, type, message, metadata = {}, ip = "" }) => {
  try {
    await Activity.create({ user, type, message, metadata, ip });
  } catch (error) {
    console.error(`Activity log failed: ${error.message}`);
  }
};

