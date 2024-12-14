import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import {validateCreate, validateLogin}  from "../validators/auth.validator.js";
const router = Router();

router.post('/register', validateCreate,authCtrl.register);
router.post('/login', validateLogin, authCtrl.login);
router.post('/logout', authCtrl.logout)

export default router;