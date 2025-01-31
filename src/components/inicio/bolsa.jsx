import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import { useCart } from "./useContext";
import styles from "./bolsa.module.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { getJWT } from "../middlewares/getToken.jsx";
import { CheckOutForm } from "./CheckoutForm.jsx";
import { AddressForm } from "./AddressForm.jsx";
import { AppointmentCalendar } from "./AppointmentCalendar.jsx";
import { CartItem } from "./CartItem.jsx";
import { formatDuration } from "./hooks/utils.js";
import { useSelectedAppointment } from "./hooks/useSelectedAppointment.js";
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
  const [decodedUserId, setDecodedUserId] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const selectedAppointmentData = useSelectedAppointment(selectedDate);
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

  useEffect(() => {
    if (loadingMobile) {
      setTimeout(() => {
        setLoadingMobile(false);
        setRedirect(true);
      }, 2000);
    }
  }, [loadingMobile]);

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/dolar");
        if (!response.ok) {
          throw new Error(`Error en consulta API DOLAR:  ${response.status}`);
        }
        const data = await response.json();
        setDolarPrice(data.price);
      } catch (error) {
        console.error("Error consultando API DOLAR", error);
      }
    };
    fetchDolar();
  }, []);

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

  const handleCalendarReset = () => {
    setSelectedDate(null);
    setCalendarKey((prevKey) => prevKey + 1);
  };

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
        return total + duration;
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

  const domicilio = isHomeService ? 5 : 0;

  const total = subtotal + iva + domicilio;

  const handleMobilePayment = async () => {
    alert(
      `Para continuar, realice el pago móvil con los siguientes datos:\n\nBanco: Banco Ejemplo\nNúmero: 0123-4567890\nCédula/RIF: V-12345678\nMonto: ${(
        total * conversion
      ).toFixed(2)} Bs.S`
    );
    let paymentReference = "";
    let cancelado = false;

    while (paymentReference.length > 15 || paymentReference === "") {
      paymentReference = prompt(
        "Por favor, ingrese el número de referencia del pago (máximo 15 caracteres):"
      );

      if (paymentReference === null) {
        cancelado = true;
        break;
      }

      if (paymentReference.length > 15) {
        alert(
          "El número de referencia excede el límite de 20 caracteres. Por favor, inténtelo de nuevo."
        );
      }
      if (paymentReference === "") {
        alert("Por favor, ingrese un valor.");
      }
    }

    if (!cancelado) {
      console.log("Número de referencia:", paymentReference);
    } else {
      console.log("El usuario canceló la entrada.");
    }

    if (paymentReference) {
      try {
        setLoadingMobile(true);

        const note = cartItems
          .filter((_, index) => selectedItems[index])
          .map((item) => item.note || "Sin nota");

        let appointmentData = null;
        if (selectedDate) {
          appointmentData = {
            start: selectedDate.formattedStart,
            end: selectedDate.formattedEnd,
            duration: formatDuration(calculateTotalDuration()),
          };
        }
        const token = getJWT("token");
        const response = await axios.post(
          "http://localhost:3000/api/orden/checkout/mobilePayment",
          {
            userId: decodedUserId,
            PrecioTotal: total,
            products: cartItems.filter((_, index) => selectedItems[index]),
            noteOfServices: note,
            cita: appointmentData,
            dirección:
              selectedLocation?.address || "Presencial en el Salón de Belleza",
            referencePayment: paymentReference,
            coordenadas:
              selectedLocation?.coordinates ||
              "{'latitud':10.493435, 'longitud': -66.878370}",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          resetCart();
          setRedirect(true);
        }
      } catch (error) {
        console.error("Error procesando pago móvil:", error);
        alert("Hubo un error al procesar el pago móvil");
      } finally {
        setLoadingMobile(false);
      }
    }
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

  const handleCashPayment = async () => {
    const confirmCash = window.confirm(
      "¿Está seguro de que desea pagar en efectivo al momento del servicio?"
    );

    if (confirmCash) {
      try {
        setLoadingCash(true);

        const note = cartItems
          .filter((_, index) => selectedItems[index])
          .map((item) => item.note || "Sin nota");

        let appointmentData = null;
        if (selectedDate) {
          appointmentData = {
            start: selectedDate.formattedStart,
            end: selectedDate.formattedEnd,
            duration: formatDuration(calculateTotalDuration()),
          };
        }
        const token = getJWT("token");
        const response = await axios.post(
          "http://localhost:3000/api/orden/checkout/cash",
          {
            userId: decodedUserId,
            PrecioTotal: total,
            products: cartItems.filter((_, index) => selectedItems[index]),
            noteOfServices: note,
            cita: appointmentData,
            dirección:
              selectedLocation?.address || "Presencial en el Salón de Belleza",
            referencePayment: "efectivo",
            coordenadas:
              selectedLocation?.coordinates ||
              "{'latitud':10.493435, 'longitud': -66.878370}",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          resetCart();
          setRedirect(true);
        }
      } catch (error) {
        console.error("Error procesando pago en efectivo:", error);
        alert("Hubo un error al procesar el pago en efectivo");
      } finally {
        setLoadingCash(false);
      }
    }
  };

  const handleDateSelect = (dateInfo) => {
    setSelectedDate(dateInfo);
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation({
      address: locationData.address,
      coordinates: locationData.coordinates,
    });
  };

  const nextStep = () => {
    if (checkoutStep < 4) {
      if (!isHomeService && checkoutStep === 2) {
        setCheckoutStep(4);
      } else {
        setCheckoutStep(checkoutStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (checkoutStep > 1) {
      if (!isHomeService && checkoutStep === 4) {
        setCheckoutStep(2);
      } else {
        setCheckoutStep(checkoutStep - 1);
      }

      if (checkoutStep === 3 || checkoutStep === 2) {
        handleCalendarReset();
      }

      if (checkoutStep === 2) {
        setSelectedDate(null);
      }
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
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>IVA:</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                {isHomeService && (
                  <div className={styles.summaryRow}>
                    <span>Domicilio:</span>
                    <span>${domicilio.toFixed(2)}</span>
                  </div>
                )}
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContainer}>
            <h2>Selección de Fecha y Hora</h2>
            <AppointmentCalendar
              key={calendarKey}
              onDateSelect={handleDateSelect}
              totalDuration={calculateTotalDuration()}
            />
          </div>
        );

      case 3:
        if (!isHomeService) {
          return null;
        }
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
                <p>
                  No se requiere ubicación para este servicio por que
                  seleccionaste ir al salón de belleza.
                </p>
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
              {selectedDate && (
                <div className={styles.selectedAppointment}>
                  <h3>Cita Seleccionada</h3>
                  <div className={styles.appointmentDetails}>
                    <p>Inicio: {selectedDate.formattedStart}</p>
                    <p>Fin: {selectedDate.formattedEnd}</p>
                    <p>
                      Duración total: {formatDuration(calculateTotalDuration())}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>IVA:</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                {isHomeService && (
                  <div className={styles.summaryRow}>
                    <span>Domicilio:</span>
                    <span>${domicilio.toFixed(2)}</span>
                  </div>
                )}
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
                    selectedAppointment={selectedAppointmentData}
                    addressAppointment={selectedLocation?.address || null}
                    appointmentCoordinates={
                      selectedLocation?.coordinates || null
                    }
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
