import { pool } from "../db.js";
import { createOrder } from "../models/appointment.model.js";
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrderHandler = async (req, res) => {
  const orderData = req.body;
  try {
    const newOrder = await createOrder(orderData);
    res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error en el controlador de crear orden:", error);
    res.status(500).json({
      success: false,
      message: "Hubo un error al crear la orden",
      error: error.message,
    });
  }
};
