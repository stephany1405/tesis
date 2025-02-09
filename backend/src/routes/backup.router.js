import { Router } from "express";
import {
  restoreDatabase,
  backupDatabase,
  compareSecretPassword,
  createSecretPassword,
} from "../controllers/backup.controller.js";
const router = Router();

router.post("/backup", backupDatabase);
router.post("/restore", restoreDatabase);
router.post("/compare", compareSecretPassword);
router.post("/secret-password", createSecretPassword);
export default router;
