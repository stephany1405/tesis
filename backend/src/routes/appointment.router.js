import { Router } from "express";
import {
  getCategory,
  getServicesByCategory,
} from "../controllers/category.controller.js";
import {
  getActiveAppointment,
  getAnonActiveAppointment,
  services,
  assignSpecialist,
  updateStatus,
  getAssignedServices,
  createRatingController,
  getStatusService,
  getClassification,
  createRatingController2,
} from "../controllers/service.controller.js";
const router = Router();

router.get("/categoria", getCategory);
router.get("/categoria/:categoryID", getServicesByCategory);
router.get("/agenda/activo", getActiveAppointment);
router.get("/agenda/noactivo", getAnonActiveAppointment);

router.get("/clientes", services);
router.post("/asignar-servicio", assignSpecialist);
router.post("/actualizar-estado", updateStatus);
router.get("/servicios-asignados/:specialistId", getAssignedServices);
router.post("/calificaciones/crear", createRatingController);
router.post("/calificaciones/crear2", createRatingController2);

router.get(
  "/especialista-estado/:appointmentId/:specialistId",
  getStatusService
);
router.get("/classification/:statusId", getClassification);
export default router;
