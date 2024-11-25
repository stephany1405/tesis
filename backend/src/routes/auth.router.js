import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";

const router = Router();

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout)

export default router;