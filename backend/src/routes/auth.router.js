import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import validateCreate  from "../validators/auth.validator.js";
const router = Router();

router.post('/user/register', validateCreate,authCtrl.register);
router.post('/user/login', authCtrl.login);
router.post('/user/logout', authCtrl.logout)

export default router;