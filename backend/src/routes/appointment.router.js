import { Router } from "express";
import * as appointment from "../controllers/category.controller.js";
const router = Router();

router.get("/categoria", appointment.getCategory);
router.get("/categoria/:categoryID", appointment.getServicesByCategory);
export default router;
