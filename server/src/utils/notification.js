import Notification from "../models/Notification.js";

export const createNotification = async ({ user, title, message, type = "info", link = "" }) => {
  try {
    return await Notification.create({ user, title, message, type, link });
  } catch (error) {
    console.error(`Notification creation failed: ${error.message}`);
    return null;
  }
};
