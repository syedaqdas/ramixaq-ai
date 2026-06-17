import express from "express";
import { createItem, deleteItem, listItems, updateItem } from "../controllers/crudController.js";
import { protect } from "../middleware/auth.js";
import Certificate from "../models/Certificate.js";

const router = express.Router();

router.use(protect);
router.route("/").get(listItems(Certificate)).post(createItem(Certificate, (data) => data, "certificate"));
router.route("/:id").put(updateItem(Certificate, (data) => data, "certificate")).delete(deleteItem(Certificate, "certificate"));

export default router;
