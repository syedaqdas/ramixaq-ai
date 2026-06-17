import express from "express";
import { getRoadmap } from "../controllers/roadmapController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getRoadmap);

export default router;

