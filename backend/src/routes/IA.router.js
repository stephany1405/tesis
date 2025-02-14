import { Router } from "express";
import {
  generateRecommendations,
  getCategoriesAndServices,
} from "../controllers/ia.controller.js";
const router = Router();

router.get("/recommendations/:userId", generateRecommendations);
router.get("/categories", getCategoriesAndServices);

export default router;
