import { Router } from "express";
import {
  getRoleClientC,
  getRoleSpecialistC,
  getRoleAdministratorC,
} from "../controllers/roles.controller.js";
const router = Router();

router.get("/getRoleClient", getRoleClientC);
router.get("/getRoleSpecialist", getRoleSpecialistC);
router.get("/getRoleAdministrator", getRoleAdministratorC);

export default router;