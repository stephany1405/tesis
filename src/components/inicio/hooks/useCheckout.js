import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getJWT } from "../../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";

export const useCheckout = (total, cartItems, selectedItems, resetCart) => {
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

      const response = await axios.post(
        "http://localhost:3000/api/orden/checkout",
        {
          id: paymentMethod.id,
          userId: decodedUserId,
          amount: Math.round(total * 100),
          products: cartItems.filter((_, index) => selectedItems[index]),
          noteOfServices: note,
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
