import e from "express";
import { pool } from "../db.js";
import { createOrder } from "../models/order.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const orderPaymentController = async (req, res) => {
  const { id, amount, products } = req.body;

  try {
    const payment = await stripe.paymentIntents.create({
      amount: parseInt(amount, 10), 
      currency: "usd", 
      description: "Compra de productos",
      payment_method: id, 
      confirm: true,
      automatic_payment_methods: {
        enabled: true, 
        allow_redirects: "never",
      },
    });
    
    res.status(200).json({
      success: true,
      message: "Pago procesado exitosamente",
      payment,
      products
    });
  } catch (error) {
    console.error("Error en el controlador de pagos:", error);

    res.status(400).json({
      success: false,
      message: error.raw?.message || "Ocurrió un error inesperado.",
    });
  }
};

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
