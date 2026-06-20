import express from "express";
import { match, search } from "../controllers/internshipController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/search", search);
router.post("/match", match);

export default router;
