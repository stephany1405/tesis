import { Router } from "express";
import { insertClient, insertSpecialist,getClients,getSpecialists } from "../controllers/users.controller.js";
const router = Router();

router.post("/registro-cliente", insertClient);
router.post("/registro-especialista", insertSpecialist);
router.get("/consulta-cliente", getClients);
router.get("/consulta-especialista", getSpecialists);


export default router;
