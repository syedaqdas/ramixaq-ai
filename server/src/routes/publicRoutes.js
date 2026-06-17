import express from "express";
import { getPublicProfile } from "../controllers/publicController.js";

const router = express.Router();

router.get("/profile/:userId", getPublicProfile);

export default router;

