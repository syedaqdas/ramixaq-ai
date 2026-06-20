import express from "express";
import {
  forgotPassword,
  getMe,
  login,
  register,
  resendVerification,
  resetPassword,
  sendLoginOtp,
  updateProfile,
  verifyEmail,
  verifyLoginOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/send-otp", sendLoginOtp);
router.post("/verify-otp", verifyLoginOtp);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/resend-verification", protect, resendVerification);

export default router;
