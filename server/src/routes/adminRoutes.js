import express from "express";
import { getActivity, getAdminSummary } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/admin.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/summary", getAdminSummary);
router.get("/activity", getActivity);

export default router;

