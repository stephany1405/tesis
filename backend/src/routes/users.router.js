import { Router } from "express";
import {
  insertClient,
  insertSpecialist,
  getClientsWithHistory,
  getSpecialistsWithHistory,
  blockUser,
  unlockUser,
  deleteUser,
  identification,
  email,
  updateUser,
  updateSpecialist,
} from "../controllers/users.controller.js";
const router = Router();

router.post("/registro-cliente", insertClient);
router.post("/registro-especialista", insertSpecialist);
router.get("/consulta-cliente", getClientsWithHistory);
router.get("/consulta-especialista", getSpecialistsWithHistory);
router.put("/bloqueo-usuario", blockUser);
router.put("/desbloqueo-usuario", unlockUser);
router.delete("/eliminar-usuario/:id", deleteUser);
router.get("/verificar-identificacion/:identification", identification);
router.get("/verificar-email/:email", email);
router.put("/actualizar-usuario/:id", updateUser);
router.put("/actualizar-especialista/:id", updateUser);

export default router;
