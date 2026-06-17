import express from "express";
import { createItem, deleteItem, listItems, updateItem } from "../controllers/crudController.js";
import { protect } from "../middleware/auth.js";
import Goal from "../models/Goal.js";

const router = express.Router();

router.use(protect);
router.route("/").get(listItems(Goal)).post(createItem(Goal, (data) => data, "goal"));
router.route("/:id").put(updateItem(Goal, (data) => data, "goal")).delete(deleteItem(Goal, "goal"));

export default router;
