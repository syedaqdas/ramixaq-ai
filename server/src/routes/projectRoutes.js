import express from "express";
import { createItem, deleteItem, listItems, updateItem } from "../controllers/crudController.js";
import { protect } from "../middleware/auth.js";
import Project from "../models/Project.js";

const router = express.Router();

const normalizeProject = (data) => ({
  ...data,
  techStack: Array.isArray(data.techStack)
    ? data.techStack.map((item) => item.trim()).filter(Boolean)
    : String(data.techStack || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
});

router.use(protect);
router.route("/").get(listItems(Project)).post(createItem(Project, normalizeProject, "project"));
router.route("/:id").put(updateItem(Project, normalizeProject, "project")).delete(deleteItem(Project, "project"));

export default router;
