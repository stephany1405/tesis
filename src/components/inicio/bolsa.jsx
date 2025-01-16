import React, { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import { useCart } from "./useContext";
import styles from "./bolsa.module.css";
import { pyDolarVenezuela } from "consulta-dolar-venezuela";

import { CheckOutForm } from "./CheckoutForm.jsx";
import { AddressForm } from "./AddressForm.jsx";
import { AppointmentCalendar } from "./AppointmentCalendar.jsx";
import { CartItem } from "./CartItem.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Bolsa = () => {
  const { cartItems, updateQuantity, removeFromCart, resetCart } = useCart();

  const [selectedItems, setSelectedItems] = useState(cartItems.map(() => true));
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [loadingCash, setLoadingCash] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [isHomeService, setIsHomeService] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isAddressFormValid, setIsAddressFormValid] = useState(false);
  const [loadingMobile, setLoadingMobile] = useState(false);
  const [dolarPrice, setDolarPrice] = useState(null);

  const navigate = useNavigate();
  const pyDolar = new pyDolarVenezuela("bcv");

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
  useEffect(() => {
    if (loadingMobile) {
      setTimeout(() => {
        setLoadingMobile(false);
        setRedirect(true);
      }, 2000);
    }
  }, [loadingMobile]);
  useEffect(() => {
    pyDolar
      .getMonitor("USD")
      .then((response) => {
        console.log(response);
        setDolarPrice(response.price);
      })
      .catch((error) => {
        console.error("Error al obtener el valor del dólar", error);
      });
  }, []);
  const conversion = dolarPrice;
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
        return total + duration * item.quantity;
      }
      return total;
    }, 0);
  };
  const subtotal = cartItems.reduce(
    (sum, item, index) =>
      sum + (selectedItems[index] ? item.price * item.quantity : 0),
    0
  );

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleMobilePayment = () => {
    setLoadingMobile(true);
  };

  const handleFormValidityChange = (isValid) => {
    setIsAddressFormValid(isValid);
  };
  const toggleForm = () => {
    setShowForm(!showForm);
  };
  const hasSelectedItems = () => {
    return selectedItems.some((selected) => selected === true);
  };
  const handleQuantityChange = (index, newQuantity) => {
    updateQuantity(cartItems[index].id, parseInt(newQuantity));
  };

  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems];
    updatedSelectedItems[index] = !updatedSelectedItems[index];
    setSelectedItems(updatedSelectedItems);
  };
  const toggleHomeService = () => {
    setIsHomeService(!isHomeService);
    if (isHomeService) {
      setSelectedLocation(null);
    }
  };
  const handleSelectAll = () => {
    setSelectedItems(selectedItems.map(() => true));
  };

  const handleRemoveItem = (index) => {
    removeFromCart(cartItems[index].id);
  };

  const handleCashPayment = () => {
    setLoadingCash(true);
  };

  const handleDateSelect = (dateInfo) => {
    setSelectedDate(dateInfo);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const nextStep = () => {
    if (checkoutStep < 4) {
      setCheckoutStep(checkoutStep + 1);
    }
  };

  const prevStep = () => {
    if (checkoutStep > 1) {
      setCheckoutStep(checkoutStep - 1);
    }
  };
  const formattedAddress = selectedLocation?.address
    ? selectedLocation.address.replace(/, /g, ",\n")
    : "No se ha especificado la dirección";

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        return (
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
                  <button
                    className={`${styles.homeServiceButton} ${
                      isHomeService ? styles.active : ""
                    }`}
                    onClick={toggleHomeService}
                  >
                    {isHomeService ? "Desactivar" : "Activar"} Servicio a
                    Domicilio
                  </button>
                </div>
              </div>

              {cartItems.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  index={index}
                  selected={selectedItems[index]}
                  onCheckboxChange={handleCheckboxChange}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContainer}>
            <h2>Selección de Fecha y Hora</h2>
            <AppointmentCalendar
              onDateSelect={handleDateSelect}
              totalDuration={calculateTotalDuration()}
            />
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContainer}>
            <h2>Ubicación del Servicio</h2>
            {isHomeService ? (
              <AddressForm
                onLocationSelect={handleLocationSelect}
                onFormValidityChange={handleFormValidityChange}
              />
            ) : (
              <div className={styles.noLocationRequired}>
                <p>No se requiere ubicación para este servicio.</p>
                <button className={styles.nextButton} onClick={nextStep}>
                  Siguiente
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className={styles.orderSummaryContainer}>
            <div className={styles.orderSummary}>
              <h2>Resumen De Servicios</h2>
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className={clsx(
                    styles.cartItemSummary,
                    styles.cartSummaryItem
                  )}
                >
                  <div className={styles.itemTitle}>
                    {item.title} - {item.quantity} sesión(es)
                  </div>
                  <div className={styles.itemDuration}>
                    Duración: {item.duration}
                  </div>
                  <div className={styles.itemPrice}>
                    Precio: ${item.price * item.quantity}
                  </div>
                  <div className={styles.itemNote}>
                    Nota: {item.note ? item.note : "Sin nota"}
                  </div>
                </div>
              ))}

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
                  <span>Total USD:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total Bs.S :</span>
                  <span>
                    {dolarPrice
                      ? (total * conversion).toFixed(2)
                      : "Cargando..."}
                  </span>
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
                  <option value="PagoMovil">Pago Móvil</option>
                </select>
              </label>
              {paymentMethod === "Tarjeta" ? (
                <button onClick={toggleForm} className={styles.payButton}>
                  {showForm
                    ? "Ocultar Formulario de Pago"
                    : "Mostrar Formulario de Pago"}
                </button>
              ) : paymentMethod === "Efectivo" ? (
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
              ) : (
                paymentMethod === "PagoMovil" && (
                  <button
                    className={styles.payButton}
                    onClick={handleMobilePayment}
                    disabled={loadingMobile}
                  >
                    {loadingMobile ? (
                      <span className={styles.loader}></span>
                    ) : (
                      "Siguiente"
                    )}
                  </button>
                )
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
            {isHomeService && selectedLocation?.address && (
              <div className={styles.addressBox}>
                <h3>Dirección de entrega</h3>
                <pre>{formattedAddress}</pre>{" "}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.bolsaContainer}>
      <div className={styles.stepIndicator}>
        <div
          className={`${styles.step} ${checkoutStep >= 1 ? styles.active : ""}`}
        >
          Servicios
        </div>
        <div
          className={`${styles.step} ${checkoutStep >= 2 ? styles.active : ""}`}
        >
          Fecha y Hora
        </div>
        {isHomeService && (
          <div
            className={`${styles.step} ${
              checkoutStep >= 3 ? styles.active : ""
            }`}
          >
            Ubicación
          </div>
        )}
        <div
          className={`${styles.step} ${checkoutStep >= 4 ? styles.active : ""}`}
        >
          Pago
        </div>
      </div>

      {renderStep()}

      <div className={styles.navigationButtons}>
        {checkoutStep > 1 && (
          <button onClick={prevStep} className={styles.prevButton}>
            Anterior
          </button>
        )}
        {checkoutStep < (isHomeService ? 4 : 3) && (
          <button
            onClick={nextStep}
            className={styles.nextButton}
            disabled={
              cartItems.length === 0 ||
              !hasSelectedItems() ||
              (checkoutStep === 2 && !selectedDate) ||
              (checkoutStep === 3 &&
                isHomeService &&
                (!selectedLocation || !isAddressFormValid))
            }
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
};

export default Bolsa;
