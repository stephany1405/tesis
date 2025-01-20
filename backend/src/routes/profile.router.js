import { Router } from "express";
import {
  getProfileController,
  uploadProfilePic,
  uploadUserData,
  changePassword,
  uploadSecurityQuestions
} from "../controllers/profile.controller.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/profile/:userID", getProfileController);
router.post(
  "/uploads/upload-photo",
  upload.single("picture_profile"),
  uploadProfilePic
);
router.put("/profile/:userID", uploadUserData);
router.put("/profile/:userID/securityQuestion", uploadSecurityQuestions);
router.put("/profile/:userID/password", changePassword);

export default router;
