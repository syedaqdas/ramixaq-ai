import express from "express";
import { createItem, deleteItem, listItems, updateItem } from "../controllers/crudController.js";
import { protect } from "../middleware/auth.js";
import Skill from "../models/Skill.js";

const router = express.Router();

router.use(protect);
router.route("/").get(listItems(Skill)).post(createItem(Skill, (data) => data, "skill"));
router.route("/:id").put(updateItem(Skill, (data) => data, "skill")).delete(deleteItem(Skill, "skill"));

export default router;
