import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
const router = Router();


router.post("/checkout/card", orderController.orderPaymentController);
router.post("/checkout/cash", orderController.cashPaymentController);
router.post("/checkout/mobilePayment", orderController.mobilePaymentController);

export default router;