import { Router } from "express";
import * as appointment from "../controllers/home_order.controller.js";
const router = Router();

//RUTAS

router.get("/categoria", appointment.getCategory);
router.get("/categoria/:categoryID", appointment.getServicesByCategory);
export default router;
