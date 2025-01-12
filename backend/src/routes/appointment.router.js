import { Router } from "express";
import {
  getCategory,
  getServicesByCategory,
} from "../controllers/category.controller.js";
const router = Router();

router.get("/categoria", getCategory);
router.get("/categoria/:categoryID", getServicesByCategory);
export default router;
