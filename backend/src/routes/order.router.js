import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
const router = Router();


router.post("/checkout", orderController.orderPaymentController);

export default router;