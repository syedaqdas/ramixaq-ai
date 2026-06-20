import express from "express";
import { getPublicPortfolio, getPublicProfile } from "../controllers/publicController.js";

const router = express.Router();

router.get("/profile/:userId", getPublicProfile);
router.get("/portfolio/:slug", getPublicPortfolio);

export default router;
