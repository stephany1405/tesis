import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { authRequiredWithRole } from "../middlewares/verifyToken.middleware.js";
const router = Router();

router.post(
  "/checkout/card",
  authRequiredWithRole("57"),
  orderController.orderPaymentController
);
router.post(
  "/checkout/cash",
  authRequiredWithRole("57"),
  orderController.cashPaymentController
);
router.post(
  "/checkout/mobilePayment",
  authRequiredWithRole("57"),
  orderController.mobilePaymentController
);

export default router;
