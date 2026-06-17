import express from "express";
import { generatePortfolio } from "../controllers/portfolioController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/generate", protect, generatePortfolio);

export default router;

