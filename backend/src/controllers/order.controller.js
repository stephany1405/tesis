import {
  InsertCard,
  InsertCash,
  InsertMobilePayment,
} from "../models/order.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const orderPaymentController = async (req, res) => {
  const {
    id,
    amount,
    products,
    noteOfServices,
    userId,
    cita,
    dirección,
    PrecioTotal,
    coordenadas,
  } = req.body;

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

    if (payment.status === "succeeded") {
      const productsWithNotes = products.map((product, index) => ({
        ...product,
        note: noteOfServices[index] || "",
      }));

      const appointmentData = {
        user_id: userId,
        services: JSON.stringify(productsWithNotes),
        scheduled_date: cita ? JSON.stringify(cita) : null,
        start_appointment: null,
        end_appointment: null,
        status_order: true,
        paid: true,
        address: dirección,
        amount: `${PrecioTotal} $`,
        referencePayment: payment.id,
        coordenadas: coordenadas,
      };

      const newAppointment = await InsertCard(appointmentData);

      res.status(200).json({
        success: true,
        message: "Pago procesado y cita creada exitosamente",
        payment: payment,
        appointment: newAppointment,
        products: productsWithNotes,
      });
    } else {
      throw new Error("El pago no pudo ser procesado.");
    }
  } catch (error) {
    console.error("Error en el controlador de pagos:", error);

    res.status(400).json({
      success: false,
      message: error.raw?.message || "Ocurrió un error inesperado.",
    });
  }
};

export const cashPaymentController = async (req, res) => {
  const {
    products,
    noteOfServices,
    userId,
    cita,
    dirección,
    PrecioTotal,
    referencePayment,
    coordenadas,
  } = req.body;

  try {
    const productsWithNotes = products.map((product, index) => ({
      ...product,
      note: noteOfServices[index] || "",
    }));

    const newAppointment = await InsertCash({
      user_id: userId,
      services: JSON.stringify(productsWithNotes),
      scheduled_date: cita || null,
      start_appointment: null,
      end_appointment: null,
      status_order: true,
      paid: false,
      address: dirección,
      amount: `${PrecioTotal} $`,
      referencePayment,
      coordenadas: coordenadas,
    });

    res.status(200).json({
      success: true,
      message: "Orden creada exitosamente para pago en efectivo",
      appointment: newAppointment,
      products: productsWithNotes,
    });
  } catch (error) {
    console.error("Error en el controlador de pago en efectivo:", error);
    res.status(400).json({
      success: false,
      message: "Ocurrió un error inesperado.",
    });
  }
};

export const mobilePaymentController = async (req, res) => {
  const {
    products,
    noteOfServices,
    userId,
    cita,
    dirección,
    PrecioTotal,
    referencePayment,
    coordenadas,
  } = req.body;

  try {
    const productsWithNotes = products.map((product, index) => ({
      ...product,
      note: noteOfServices[index] || "",
    }));

    const newAppointment = await InsertMobilePayment({
      user_id: userId,
      services: JSON.stringify(productsWithNotes),
      scheduled_date: cita || null,
      start_appointment: null,
      end_appointment: null,
      status_order: true,
      paid: true,
      address: dirección,
      amount: `${PrecioTotal} $`,
      referencePayment: referencePayment,
      coordenadas: coordenadas,
    });

    res.status(200).json({
      success: true,
      message: "Orden creada exitosamente para pago móvil",
      appointment: newAppointment,
      products: productsWithNotes,
    });
  } catch (error) {
    console.error("Error en el controlador de pago móvil:", error);
    res.status(400).json({
      success: false,
      message: "Ocurrió un error inesperado.",
    });
  }
};
