import { Router } from "express";
import { getBCV } from "../controllers/bcv.controller.js";
const router = Router();
router.get("/dolar", getBCV);
export default router;
