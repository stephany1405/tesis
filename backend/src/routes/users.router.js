import { Router } from "express";
import {
  insertClient,
  insertSpecialist,
  getClientsWithHistory,
  getSpecialistsWithHistory,
  blockUser,
  unlockUser,
} from "../controllers/users.controller.js";
const router = Router();

router.post("/registro-cliente", insertClient);
router.post("/registro-especialista", insertSpecialist);
router.get("/consulta-cliente", getClientsWithHistory);
router.get("/consulta-especialista", getSpecialistsWithHistory);
router.put("/bloqueo-usuario", blockUser);
router.put("/desbloqueo-usuario", unlockUser);

export default router;
