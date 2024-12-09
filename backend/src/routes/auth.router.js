import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import {validateCreate, validateLogin}  from "../validators/auth.validator.js";
const router = Router();

router.post('/user/register', validateCreate,authCtrl.register);
router.post('/user/login', validateLogin, authCtrl.login);
router.post('/user/logout', authCtrl.logout)

export default router;