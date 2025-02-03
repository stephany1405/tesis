import { Router } from "express";
import {
  getAppointmentStatistics,
  getClientStatistics,
  getSpecialistStatistics,
  getPaymentMethod,
  dashboardConnect,
} from "../controllers/statistics.controller.js";

const router = Router();

router.get("/estadistica/citas", getAppointmentStatistics);
router.get("/estadistica/clientes", getClientStatistics);
router.get("/estadistica/especialistas", getSpecialistStatistics);
router.get("/estadistica/metodosPago", getPaymentMethod);
router.get("/estadistica/dashboard", dashboardConnect);

export default router;
