import { Router } from "express";
import {
  getCategory,
  getServicesByCategory,
} from "../controllers/category.controller.js";
import {getActiveAppointment, getAnonActiveAppointment} from "../controllers/service.controller.js"
const router = Router();

router.get("/categoria", getCategory);
router.get("/categoria/:categoryID", getServicesByCategory);
router.get("/agenda/activo", getActiveAppointment)
router.get("/agenda/noactivo", getAnonActiveAppointment)
export default router;