import { useState, useEffect } from "react"
import clsx from "clsx"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useNavigate } from "react-router-dom"
import { useCart } from "../inicio/useContext.jsx"
import styles from "./bolsa.module.css"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { FaShoppingCart, FaCalendarAlt, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa"

import { getJWT } from "../middlewares/getToken.jsx"
import { CheckOutForm } from "../inicio/CheckoutForm.jsx"
import { AddressForm } from "../inicio/AddressForm.jsx"
import { AppointmentCalendar } from "../inicio/AppointmentCalendar.jsx"
import { CartItem } from "../inicio/CartItem.jsx"
import { formatDuration } from "../inicio/hooks/utils.js"
import { useSelectedAppointment } from "../inicio/hooks/useSelectedAppointment.js"
import Modal from "./modal.jsx"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const Bolsa = () => {
  const { cartItems, updateQuantity, removeFromCart, resetCart } = useCart()
  const navigate = useNavigate()

  const [selectedItems, setSelectedItems] = useState(cartItems.map(() => true))
  const [showForm, setShowForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("Efectivo") // Updated initial state
  const [loadingCash, setLoadingCash] = useState(false)
  const [redirect, setRedirect] = useState(false)
  const [isHomeService, setIsHomeService] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [isAddressFormValid, setIsAddressFormValid] = useState(false)
  const [loadingMobile, setLoadingMobile] = useState(false)
  const [dolarPrice, setDolarPrice] = useState(null)
  const [decodedUserId, setDecodedUserId] = useState(null)
  const [calendarKey, setCalendarKey] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", message: "" })
  const [paymentReference, setPaymentReference] = useState("")
  const [showReferenceInput, setShowReferenceInput] = useState(false)

  const selectedAppointmentData = useSelectedAppointment(selectedDate)

  useEffect(() => {
    if (redirect) {
      navigate("/checkout/success", { replace: true })
    }
  }, [redirect, navigate])

  useEffect(() => {
    if (loadingCash) {
      setTimeout(() => {
        setLoadingCash(false)
        setRedirect(true)
      }, 2000)
    }
  }, [loadingCash])

  useEffect(() => {
    setSelectedItems(cartItems.map(() => true))
  }, [cartItems])

  useEffect(() => {
    if (loadingMobile) {
      setTimeout(() => {
        setLoadingMobile(false)
        setRedirect(true)
      }, 2000)
    }
  }, [loadingMobile])

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/dolar")
        if (!response.ok) {
          throw new Error(`Error en consulta API DOLAR:  ${response.status}`)
        }
        const data = await response.json()
        setDolarPrice(data.price)
      } catch (error) {
        console.error("Error consultando API DOLAR", error)
      }
    }
    fetchDolar()
  }, [])

  useEffect(() => {
    const handleToken = async () => {
      const token = getJWT("token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      try {
        const { id: decodedUserId } = jwtDecode(token)
        setDecodedUserId(decodedUserId)
      } catch (error) {
        console.log("Error decoding token:", error)
      }
    }
    handleToken()
  }, [])

  const handleCalendarReset = () => {
    setSelectedDate(null)
    setCalendarKey((prevKey) => prevKey + 1)
  }

  const conversion = dolarPrice

  const parseDuration = (durationString) => {
    if (!durationString) return 0

    const parts = durationString.split(" ")
    let hours = 0
    let minutes = 0

    for (let i = 0; i < parts.length; i++) {
      const value = Number.parseInt(parts[i])
      if (isNaN(value)) continue

      if (parts[i + 1] === "hora" || parts[i + 1] === "horas") {
        hours = value
        i++
      } else if (parts[i + 1] === "minuto" || parts[i + 1] === "minutos") {
        minutes = value
        i++
      }
    }

    return hours + minutes / 60
  }

  const calculateTotalDuration = () => {
    return cartItems.reduce((total, item, index) => {
      if (selectedItems[index] && item.duration) {
        const duration = parseDuration(item.duration)
        return total + duration
      }
      return total
    }, 0)
  }

  const subtotal = cartItems.reduce(
    (sum, item, index) => sum + (selectedItems[index] ? item.price * item.quantity : 0),
    0,
  )

  const iva = subtotal * 0.16
  const domicilio = isHomeService ? 5 : 0
  const total = subtotal + iva + domicilio

  const handleMobilePayment = async () => {
    setModalContent({
      title: "Pago Móvil",
      message: `Para continuar, realice el pago móvil con los siguientes datos:

Banco: Banco Ejemplo
Número: 0123-4567890
Cédula/RIF: V-12345678
Monto: ${(total * conversion).toFixed(2)} Bs.S`,
    })
    setIsModalOpen(true)
    setShowReferenceInput(false)
  }

  const handleCashPayment = async () => {
    setModalContent({
      title: "Confirmación de Pago en Efectivo",
      message: "¿Está seguro de que desea pagar en efectivo al momento del servicio?",
    })
    setIsModalOpen(true)
  }

  const processCashPayment = async () => {
    try {
      setLoadingCash(true)

      const note = cartItems.filter((_, index) => selectedItems[index]).map((item) => item.note || "Sin nota")

      let appointmentData = null
      if (selectedDate) {
        appointmentData = {
          start: selectedDate.formattedStart,
          end: selectedDate.formattedEnd,
          duration: formatDuration(calculateTotalDuration()),
        }
      }
      const token = getJWT("token")
      const response = await axios.post(
        "http://localhost:3000/api/orden/checkout/cash",
        {
          userId: decodedUserId,
          PrecioTotal: total,
          products: cartItems.filter((_, index) => selectedItems[index]),
          noteOfServices: note,
          cita: appointmentData,
          dirección: selectedLocation?.address || "Presencial en el Salón de Belleza",
          referencePayment: "efectivo",
          coordenadas: selectedLocation?.coordinates || "{'latitud':10.493435, 'longitud': -66.878370}",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        resetCart()
        setRedirect(true)
      }
    } catch (error) {
      console.error("Error procesando pago en efectivo:", error)
      alert("Hubo un error al procesar el pago en efectivo")
    } finally {
      setLoadingCash(false)
      setIsModalOpen(false)
    }
  }

  const processMobilePayment = async () => {
    try {
      setLoadingMobile(true)

      const note = cartItems.filter((_, index) => selectedItems[index]).map((item) => item.note || "Sin nota")

      let appointmentData = null
      if (selectedDate) {
        appointmentData = {
          start: selectedDate.formattedStart,
          end: selectedDate.formattedEnd,
          duration: formatDuration(calculateTotalDuration()),
        }
      }
      const token = getJWT("token")
      const response = await axios.post(
        "http://localhost:3000/api/orden/checkout/mobilePayment",
        {
          userId: decodedUserId,
          PrecioTotal: total,
          products: cartItems.filter((_, index) => selectedItems[index]),
          noteOfServices: note,
          cita: appointmentData,
          dirección: selectedLocation?.address || "Presencial en el Salón de Belleza",
          referencePayment: paymentReference,
          coordenadas: selectedLocation?.coordinates || "{'latitud':10.493435, 'longitud': -66.878370}",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        resetCart()
        setRedirect(true)
      }
    } catch (error) {
      console.error("Error procesando pago móvil:", error)
      alert("Hubo un error al procesar el pago móvil")
    } finally {
      setLoadingMobile(false)
      setIsModalOpen(false)
      setShowReferenceInput(false)
      setPaymentReference("")
    }
  }

  const handleModalConfirm = () => {
    if (paymentMethod === "Efectivo") {
      processCashPayment()
    } else if (paymentMethod === "PagoMovil") {
      if (!showReferenceInput) {
        setShowReferenceInput(true)
        setModalContent({
          title: "Número de Referencia",
          message: "Por favor, ingrese el número de referencia del pago:",
        })
      } else {
        if (paymentReference.length === 12) {
          processMobilePayment()
        } else {
          alert("El número de referencia debe tener exactamente 12 caracteres.")
        }
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setShowReferenceInput(false)
    setPaymentReference("")
  }

  const handleFormValidityChange = (isValid) => {
    setIsAddressFormValid(isValid)
  }

  const toggleForm = () => {
    setShowForm(!showForm)
  }

  const hasSelectedItems = () => {
    return selectedItems.some((selected) => selected === true)
  }

  const handleQuantityChange = (index, newQuantity) => {
    updateQuantity(cartItems[index].id, Number.parseInt(newQuantity))
  }

  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems]
    updatedSelectedItems[index] = !updatedSelectedItems[index]
    setSelectedItems(updatedSelectedItems)
  }

  const toggleHomeService = () => {
    setIsHomeService(!isHomeService)
    if (isHomeService) {
      setSelectedLocation(null)
    }
  }

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.map(() => true))
  }

  const handleRemoveItem = (index) => {
    removeFromCart(cartItems[index].id)
  }

  const handleDateSelect = (dateInfo) => {
    setSelectedDate(dateInfo)
  }

  const handleLocationSelect = (locationData) => {
    setSelectedLocation({
      address: locationData.address,
      coordinates: locationData.coordinates,
    })
  }

  const nextStep = () => {
    if (checkoutStep < 4) {
      if (!isHomeService && checkoutStep === 2) {
        setCheckoutStep(4)
      } else {
        setCheckoutStep(checkoutStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (checkoutStep > 1) {
      if (!isHomeService && checkoutStep === 4) {
        setCheckoutStep(2)
      } else {
        setCheckoutStep(checkoutStep - 1)
      }

      if (checkoutStep === 3 || checkoutStep === 2) {
        handleCalendarReset()
      }

      if (checkoutStep === 2) {
        setSelectedDate(null)
      }
    }
  }

  const formattedAddress = selectedLocation?.address
    ? selectedLocation.address.replace(/, /g, ",\n")
    : "No se ha especificado la dirección"

  const renderCartStep = () => (
    <div className={styles.bolsaContent}>
      <div className={styles.bolsaItems}>
        <div className={styles.itemsHeader}>
          <h2>SERVICIOS SELECCIONADOS ({cartItems.length})</h2>
          <div className={styles.headerActions}>
            <button
              className={`${styles.homeServiceButton} ${isHomeService ? styles.active : ""}`}
              onClick={toggleHomeService}
            >
              {isHomeService ? "Desactivar" : "Activar"} Servicio a Domicilio
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
            <span>{dolarPrice ? (total * conversion).toFixed(2) : "Cargando..."}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppointmentStep = () => (
    <div className={styles.stepContainer}>
      <h2>Selección de Fecha y Hora</h2>
      <AppointmentCalendar key={calendarKey} onDateSelect={handleDateSelect} totalDuration={calculateTotalDuration()} />
    </div>
  )

  const renderLocationStep = () => (
    <div className={styles.stepContainer}>
      <h2>Ubicación del Servicio</h2>
      {isHomeService ? (
        <AddressForm onLocationSelect={handleLocationSelect} onFormValidityChange={handleFormValidityChange} />
      ) : (
        <div className={styles.noLocationRequired}>
          <p>No se requiere ubicación para este servicio por que seleccionaste ir al salón de belleza.</p>
          <button className={styles.nextButton} onClick={nextStep}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  )

  const renderPaymentStep = () => (
    <div className={styles.orderSummaryContainer}>
      <div className={styles.orderSummary}>
        <h2>Resumen De Servicios</h2>
        <div className={styles.summaryAndAddressGrid}>
          <div className={styles.summaryColumn}>
            {cartItems.map((item, index) => (
              <div key={index} className={clsx(styles.cartItemSummary, styles.cartSummaryItem)}>
                <div className={styles.itemTitle}>
                  {item.title} - {item.quantity} sesión(es)
                </div>
                <div className={styles.itemDuration}>Duración: {item.duration}</div>
                <div className={styles.itemPrice}>Precio: ${item.price * item.quantity}</div>
                <div className={styles.itemNote}>Nota: {item.note ? item.note : "Sin nota"}</div>
              </div>
            ))}
            {selectedDate && (
              <div className={styles.selectedAppointment}>
                <h3>Cita Seleccionada</h3>
                <div className={styles.appointmentDetails}>
                  <p>Inicio: {selectedDate.formattedStart}</p>
                  <p>Fin: {selectedDate.formattedEnd}</p>
                  <p>Duración total: {formatDuration(calculateTotalDuration())}</p>
                </div>
              </div>
            )}
          </div>
          <div className={styles.addressColumn}>
            {isHomeService && selectedLocation?.address && (
              <div className={styles.addressBox}>
                <h3>Dirección de entrega</h3>
                <pre>{formattedAddress}</pre>
              </div>
            )}
          </div>
        </div>

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
            <span>{dolarPrice ? (total * conversion).toFixed(2) : "Cargando..."}</span>
          </div>
        </div>
        <label>
          Método de pago:
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={styles.paymentMethodSelect}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="PagoMovil">Pago Móvil</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </label>

        {paymentMethod === "Efectivo" && (
          <button className={styles.payButton} onClick={handleCashPayment} disabled={loadingCash}>
            {loadingCash ? <span className={styles.loader}></span> : "Pagar en Efectivo"}
          </button>
        )}

        {paymentMethod === "PagoMovil" && (
          <button className={styles.payButton} onClick={handleMobilePayment} disabled={loadingMobile}>
            {loadingMobile ? <span className={styles.loader}></span> : "Pagar con Pago Móvil"}
          </button>
        )}
        {paymentMethod === "Tarjeta" && (
          <div className={styles.paymentFormContainer}>
            <Elements stripe={stripePromise}>
              <CheckOutForm
                total={total}
                cartItems={cartItems}
                selectedItems={selectedItems}
                resetCart={resetCart}
                selectedAppointment={selectedAppointmentData}
                addressAppointment={selectedLocation?.address || null}
                appointmentCoordinates={selectedLocation?.coordinates || null}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        return renderCartStep()
      case 2:
        return renderAppointmentStep()
      case 3:
        return isHomeService ? renderLocationStep() : null
      case 4:
        return renderPaymentStep()
      default:
        return null
    }
  }

  return (
    <div className={styles.bolsaContainer}>
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${checkoutStep >= 1 ? styles.active : ""}`}>
          <FaShoppingCart />
          <span>Servicios</span>
        </div>
        <div className={`${styles.step} ${checkoutStep >= 2 ? styles.active : ""}`}>
          <FaCalendarAlt />
          <span>Fecha y Hora</span>
        </div>
        {isHomeService && (
          <div className={`${styles.step} ${checkoutStep >= 3 ? styles.active : ""}`}>
            <FaMapMarkerAlt />
            <span>Ubicación</span>
          </div>
        )}
        <div className={`${styles.step} ${checkoutStep >= 4 ? styles.active : ""}`}>
          <FaCreditCard />
          <span>Pago</span>
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
              (checkoutStep === 3 && isHomeService && (!selectedLocation || !isAddressFormValid))
            }
          >
            Siguiente
          </button>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleModalClose} onConfirm={handleModalConfirm} title={modalContent.title}>
        <p>{modalContent.message}</p>
        {showReferenceInput && (
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "")
              if (value.length <= 12) {
                setPaymentReference(value)
              }
            }}
            placeholder="Número de referencia (12 dígitos)"
            className={styles.referenceInput}
          />
        )}
      </Modal>
    </div>
  )
}

export default Bolsa

