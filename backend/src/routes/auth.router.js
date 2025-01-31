import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import { validateCreate, validateLogin } from "../validators/auth.validator.js";
const router = Router();
router.post("/register", validateCreate, authCtrl.register);
router.post("/login", validateLogin, authCtrl.login);
router.post("/logout", authCtrl.logout);
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/verify-code", authCtrl.verifyCode);
router.post("/change-password", authCtrl.changePassword);
router.post("/security-question", authCtrl.getSecurityQuestion);
router.post("/answer-security-question", authCtrl.verifyAnswer);

export default router;
