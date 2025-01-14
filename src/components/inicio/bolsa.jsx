import React, { useState, useEffect } from "react";
import styles from "./bolsa.module.css";
import Header from "./header";
import { useCart } from "./useContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const token = getJWT("token");
const { id } = jwtDecode(token);

const useCheckout = (total, cartItems, selectedItems, resetCart) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (redirect) {
      navigate("/checkout/success", { replace: true });
    }
  }, [redirect, navigate]);

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
          userId: id,
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

  return { handleSubmit, loading, error };
};

const CheckOutForm = ({ total, cartItems, selectedItems, resetCart }) => {
  const { handleSubmit, loading, error } = useCheckout(
    total,
    cartItems,
    selectedItems,
    resetCart
  );

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.cardElementContainer}>
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <button type="submit" className={styles.paymentButton} disabled={loading}>
        {loading ? <span className={styles.loader}></span> : "Pagar"}
      </button>
    </form>
  );
};

const Bolsa = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    resetCart,
    updateHomeService,
  } = useCart();
  const [selectedItems, setSelectedItems] = useState(cartItems.map(() => true));
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [loadingCash, setLoadingCash] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      navigate("/checkout/success", { replace: true });
    }
  }, [redirect, navigate]);
  useEffect(() => {
    if (loadingCash) {
      setTimeout(() => {
        setLoadingCash(false);
        setRedirect(true);
      }, 2000);
    }
  }, [loadingCash]);

  useEffect(() => {
    setSelectedItems(cartItems.map(() => true));
  }, [cartItems]);

  const subtotal = cartItems.reduce(
    (sum, item, index) =>
      sum + (selectedItems[index] ? item.price * item.quantity : 0),
    0
  );

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleQuantityChange = (index, newQuantity) => {
    updateQuantity(cartItems[index].id, parseInt(newQuantity));
  };

  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems];
    updatedSelectedItems[index] = !updatedSelectedItems[index];
    setSelectedItems(updatedSelectedItems);
  };

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.map(() => true));
  };

  const handleRemoveItem = (index) => {
    removeFromCart(cartItems[index].id);
  };

  const handleGlobalHomeServiceChange = () => {
    const allHomeService = cartItems.every((item) => item.homeService);
    cartItems.forEach((item) => {
      updateHomeService(item.id, !allHomeService);
    });
  };

  const handleCashPayment = () => {
    setLoadingCash(true);
  };

  return (
    <div className={styles.bolsaContainer}>
      <div className={styles.bolsaContent}>
        <div className={styles.bolsaItems}>
          <div className={styles.itemsHeader}>
            <h2>SERVICIOS SELECCIONADOS ({cartItems.length})</h2>
            <div className={styles.headerActions}>
              <button
                className={styles.selectAllButton}
                onClick={handleSelectAll}
              >
                Seleccionar Todo
              </button>
              <div className={styles.homeServiceOption}>
                <label>
                  <input
                    type="checkbox"
                    checked={cartItems.every((item) => item.homeService)}
                    onChange={handleGlobalHomeServiceChange}
                  />
                  Servicio a domicilio
                </label>
              </div>
            </div>
          </div>

          {cartItems.map((item, index) => (
            <div key={index} className={styles.item}>
              <input
                type="checkbox"
                checked={selectedItems[index]}
                onChange={() => handleCheckboxChange(index)}
                className={styles.itemCheckbox}
              />
              <div className={styles.itemDetails}>
                <h3>{item.title}</h3>
                <div className={styles.itemVariant}>
                  Duración: {item.duration}
                </div>
                <div className={styles.itemDescription}>
                  <strong>Descripción:</strong> {item.description}
                </div>
                <div className={styles.itemActions}>
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                    className={styles.quantitySelect}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "sesión" : "sesiones"}
                      </option>
                    ))}
                  </select>
                  <span className={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveItem(index)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.orderSummary}>
          <h2>Resumen De Servicios</h2>
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>IVA:</span>
              <span>${iva.toFixed(2)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <label>
            Método de pago:
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={styles.paymentMethodSelect}
            >
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </label>
          {paymentMethod === "Tarjeta" ? (
            <button onClick={toggleForm} className={styles.payButton}>
              {showForm
                ? "Ocultar Formulario de Pago"
                : "Mostrar Formulario de Pago"}
            </button>
          ) : (
            <button
              className={styles.payButton}
              onClick={handleCashPayment}
              disabled={loadingCash}
            >
              {loadingCash ? (
                <span className={styles.loader}></span>
              ) : (
                "Siguiente"
              )}
            </button>
          )}
          {showForm && paymentMethod === "Tarjeta" && (
            <Elements stripe={stripePromise}>
              <CheckOutForm
                total={total}
                cartItems={cartItems}
                selectedItems={selectedItems}
                resetCart={resetCart}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bolsa;
