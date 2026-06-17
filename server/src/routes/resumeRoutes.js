import express from "express";
import { downloadResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/download", protect, downloadResume);

export default router;

