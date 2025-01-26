import { Router } from "express";
import {
  geolocation,
  geocodificación,
} from "../controllers/geocode.controller.js";
const router = Router();

router.get("/geocode/search", geolocation);
router.get("/geocode/reverse", geocodificación);
export default router;
