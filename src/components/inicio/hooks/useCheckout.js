import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getJWT } from "../../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import { formatDuration } from "./utils.js";
export const useCheckout = (
  total,
  cartItems,
  selectedItems,
  resetCart,
  selectedAppointment,
  addressAppointment,
  appointmentCoordinates
) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();
  const [decodedUserId, setDecodedUserId] = useState(null);

  useEffect(() => {
    const handleToken = async () => {
      const token = getJWT("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const { id: decodedUserId } = jwtDecode(token);
        setDecodedUserId(decodedUserId);
      } catch (error) {
        console.log("Error decoding token:", error);
      }
    };
    handleToken();
  }, []);
  const parseDuration = (durationString) => {
    if (!durationString) return 0;

    const parts = durationString.split(" ");
    let hours = 0;
    let minutes = 0;

    for (let i = 0; i < parts.length; i++) {
      const value = parseInt(parts[i]);
      if (isNaN(value)) continue;

      if (parts[i + 1] === "hora" || parts[i + 1] === "horas") {
        hours = value;
        i++;
      } else if (parts[i + 1] === "minuto" || parts[i + 1] === "minutos") {
        minutes = value;
        i++;
      }
    }

    return hours + minutes / 60;
  };
  const calculateTotalDuration = () => {
    return cartItems.reduce((total, item, index) => {
      if (selectedItems[index] && item.duration) {
        const duration = parseDuration(item.duration);
        return total + duration;
      }
      return total;
    }, 0);
  };
  const processPayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (!stripe || !elements) {
        throw new Error("Stripe.js aún no se ha cargado.");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        console.error("CardElement no está montado.");
        throw new Error("CardElement no encontrado.");
      }

      setLoading(true);

      const { error: paymentError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (paymentError) {
        throw paymentError;
      }
      const note = cartItems
        .filter((_, index) => selectedItems[index])
        .map((item) => item.note || "Sin nota");

      let appointmentData = null;
      if (selectedAppointment) {
        appointmentData = {
          start: selectedAppointment?.formattedStart || null,
          end: selectedAppointment?.formattedEnd || null,
          duration: formatDuration(calculateTotalDuration()) || null,
        };
      }
      const token = getJWT("token");
      const response = await axios.post(
        "http://localhost:3000/api/orden/checkout/card",
        {
          id: paymentMethod.id,
          userId: decodedUserId,
          amount: Math.round(total * 100),
          PrecioTotal: total,
          products: cartItems.filter((_, index) => selectedItems[index]),
          noteOfServices: note,
          cita: appointmentData,
          dirección: addressAppointment || "Presencial en el Salón de Belleza",
          referencePayment: "",
          coordenadas:
            appointmentCoordinates ||
            "{'latitud':10.493435, 'longitud': -66.878370}",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (elements) {
          const cardElement = elements.getElement(CardElement);
          if (cardElement) {
            cardElement.clear();
          }
        }
        resetCart();
        setRedirect(true);
      }

      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setError(null);

    try {
      const data = await processPayment();
      console.log("Pago exitoso:", data);
    } catch (err) {
      console.error("Error durante la verificación:", err);
      setError(err.message || "Algo salió mal.");
    }
  };

  useEffect(() => {
    if (redirect) {
      navigate("/checkout/success", { replace: true });
    }
  }, [redirect, navigate]);
  return { handleSubmit, loading, error };
};
