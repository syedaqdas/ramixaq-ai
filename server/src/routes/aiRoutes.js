import express from "express";
import multer from "multer";
import {
  analyzeResume,
  analyzeSkillGap,
  getInternshipRecommendations,
  getResumeAnalyses
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (file.mimetype !== "application/pdf") {
      return callback(new Error("Only PDF resumes are supported"));
    }

    callback(null, true);
  }
});

router.use(protect);
router.post("/resume/analyze", upload.single("resume"), analyzeResume);
router.get("/resume/analyses", getResumeAnalyses);
router.post("/skill-gap", analyzeSkillGap);
router.get("/internships", getInternshipRecommendations);

export default router;

