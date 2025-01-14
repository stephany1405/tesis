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

const Bolsa = () => {
  const { cartItems, updateQuantity, removeFromCart, resetCart, updateHomeService } = useCart();
  const [selectedItems, setSelectedItems] = useState(cartItems.map(() => true));
  const navigate = useNavigate();
  const [showHomeService, setShowHomeService] = useState(false);
  const [address, setAddress] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

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
    const allHomeService = cartItems.every(item => item.homeService);
    cartItems.forEach(item => {
      updateHomeService(item.id, !allHomeService);
    });
  };

  const handleHomeServiceToggle = () => {
    setShowHomeService(!showHomeService);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

  const useCheckout = (total) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const processPayment = async () => {
      if (!stripe || !elements) {
        throw new Error("Stripe.js aún no se ha cargado.");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("CardElement no encontrado.");
      }

      const { error: paymentError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (paymentError) {
        throw paymentError;
      }

      const { id } = paymentMethod;

      const response = await axios.post(
        "http://localhost:3000/api/orden/checkout",
        {
          id: id,
          amount: Math.round(total * 100),
          products: cartItems.filter((_, index) => selectedItems[index]),
        }
      );

      return response.data;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const data = await processPayment();
        console.log("Pago exitoso:", data);
        elements.getElement(CardElement).clear();
        resetCart();
        navigate("/success");
      } catch (err) {
        console.error("Error durante la verificación:", err);
        setError(err.message || "Algo salió mal.");
      } finally {
        setLoading(false);
      }
    };

    return { handleSubmit, loading, error };
  };

  const CheckOutForm = ({ total }) => {
    const { handleSubmit, loading, error } = useCheckout(total);

    return (
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <div className={styles.cardElementContainer}>
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button
          type="submit"
          className={styles.paymentButton}
          disabled={loading}
        >
          {loading ? <span className={styles.loader}></span> : "Pagar"}
        </button>
      </form>
    );
  };

  return (
    <>
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
                      checked={cartItems.every(item => item.homeService)}
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
            <div className={styles.homeServiceSection}>
              <button onClick={handleHomeServiceToggle} className={styles.homeServiceButton}>
                {showHomeService ? 'Desactivar servicio a domicilio' : 'Activar servicio a domicilio'}
              </button>
              {showHomeService && (
                <div className={styles.addressInputContainer}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Introduce tu dirección"
                    className={styles.addressInput}
                  />
                  <div className={styles.mapPlaceholder}>
                    {/* Aquí irá el mapa */}
                    <p>Mapa se mostrará aquí</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.scheduleServiceSection}>
              
                <p> Agenda tu servicio</p> 
              {showCalendar && (
                <div className={styles.calendarPlaceholder}>
                  {/* Aquí irá el calendario */}
                  <p>Calendario se mostrará aquí</p>
                </div>
              )}
            </div>

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

            <button onClick={toggleForm} className={styles.payButton}>
              {showForm
                ? "Ocultar Formulario de Pago"
                : "Mostrar Formulario de Pago"}{" "}
              ({cartItems.filter((_, index) => selectedItems[index]).length})
            </button>
           
            {showForm && (
              <Elements stripe={stripePromise}>
                <CheckOutForm total={total} />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Bolsa;

