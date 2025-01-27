import { Router } from "express";
import { getAppointmentStatistics } from "../controllers/statistics.controller.js";

const router = Router();

router.get("/estadistica/citas", getAppointmentStatistics);

export default router;
