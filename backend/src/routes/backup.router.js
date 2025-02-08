import { Router } from "express";
import {
  restoreDatabase,
  backupDatabase,
} from "../controllers/backup.controller.js";
const router = Router();

router.post("/backup", backupDatabase);
router.post("/restore", restoreDatabase);
export default router;
