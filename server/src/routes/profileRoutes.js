import express from "express";
import multer from "multer";
import { exportProfilePdf, uploadAvatar } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(new Error("Profile photo must be JPG, PNG, or WebP"));
    }
    callback(null, true);
  }
});

router.use(protect);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.get("/export", exportProfilePdf);

export default router;
