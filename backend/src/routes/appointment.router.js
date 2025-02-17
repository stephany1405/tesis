import { Router } from "express";
import {
  getCategory,
  getServicesByCategory,
  createCategory,
  createServiceOfCategory,
  deleteServiceOfCategory,
  updateServiceOfCategory,
  deleteService,
  editCategory,
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
  getInPersonAppointments,
  cancelAppointment,
  historySpecialist,
  addSpecialistToAppointment,
  updateAppointmentSpecialist,
  getAvailability,
  cancelInPersonAppointment,
  changeAppointmentDay,
} from "../controllers/service.controller.js";
import { upload2, upload3 } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/categoria", getCategory);
router.get("/categoria/:categoryID", getServicesByCategory);
router.post("/nuevaCategoria", upload2.single("image"), createCategory);
router.post("/nuevoServicio", upload3.single("image"), createServiceOfCategory);
router.put("/eliminarServicio/:id", deleteServiceOfCategory);
router.put("/eliminarServiciodeCategoria/:id", deleteService);
router.put(
  "/actualizarServicio/:id",
  upload3.single("image"),
  updateServiceOfCategory
);
router.put("/actualizar-categoria/:id", upload2.single("image"), editCategory);

router.get("/agenda/activo", getActiveAppointment);
router.get("/agenda/noactivo", getAnonActiveAppointment);
router.get("/agenda/presencial", getInPersonAppointments);

router.get("/clientes", services);
router.post("/cancelar", cancelAppointment);
router.post("/asignar-servicio", assignSpecialist);
router.post("/actualizar-estado", updateStatus);
router.get("/servicios-asignados/:specialistId", getAssignedServices);
router.put(
  "/agenda/:appointmentId/cambiar-especialista",
  updateAppointmentSpecialist
);
router.put("/cancelAppointment/:appointmentId", cancelInPersonAppointment);
router.put("/agenda/:id/cambiar-fecha", changeAppointmentDay);

router.post("/calificaciones/crear", createRatingController);
router.post("/calificaciones/crear2", createRatingController2);
router.get("/historia-especialista", historySpecialist);
router.post("/agenda/:appointmentId/especialista", addSpecialistToAppointment);
router.get(
  "/especialista-estado/:appointmentId/:specialistId",
  getStatusService
);
router.get("/classification/:statusId", getClassification);
router.get("/availability", getAvailability);
export default router;
