import express from "express";
import multer from "multer";
import { downloadResume, uploadAndParseResume } from "../controllers/resumeController.js";
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

router.post("/upload", protect, upload.single("resume"), uploadAndParseResume);
router.get("/download", protect, downloadResume);

export default router;
