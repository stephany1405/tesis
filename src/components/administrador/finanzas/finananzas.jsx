import React, { useState } from "react"
import styles from "./finanzas.module.css"

const FinanceManagement = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      name: "Juan Pérez",
      method: "Efectivo",
      amount: 50.0,
      confirmed: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "María García",
      method: "Pago Móvil",
      amount: 75.5,
      confirmed: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      method: "Efectivo",
      amount: 100.0,
      confirmed: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Ana Martínez",
      method: "Pago Móvil",
      amount: 60.0,
      confirmed: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const [references, setReferences] = useState({})

  const handleReferenceChange = (id, value) => {
    setReferences({ ...references, [id]: value })
  }

  const handleConfirmPayment = (id) => {
    setPayments(payments.map((payment) => (payment.id === id ? { ...payment, confirmed: true } : payment)))
    // Clear the reference after confirming the payment
    setReferences({ ...references, [id]: "" })
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestión de Finanzas - Pagos en Efectivo y Móvil</h2>
      <div className={styles.paymentList}>
        {payments.map((payment) => (
          <div key={payment.id} className={styles.paymentItem}>
            <div className={styles.paymentInfo}>
              <img src={payment.avatar || "/placeholder.svg"} alt={payment.name} className={styles.avatar} />
              <div className={styles.details}>
                <div className={styles.name}>{payment.name}</div>
                <div className={styles.paymentMethod}>{payment.method}</div>
                <div className={styles.amount}>${payment.amount.toFixed(2)}</div>
              </div>
            </div>
            <div className={styles.actions}>
              {payment.confirmed ? (
                <span className={styles.confirmedText}>Pago Confirmado</span>
              ) : (
                <>
                  {payment.method === "Pago Móvil" && (
                    <input
                      type="text"
                      placeholder="Referencia"
                      className={styles.referenceInput}
                      value={references[payment.id] || ""}
                      onChange={(e) => handleReferenceChange(payment.id, e.target.value)}
                    />
                  )}
                  <button
                    className={styles.confirmButton}
                    onClick={() => handleConfirmPayment(payment.id)}
                    disabled={payment.method === "Pago Móvil" && !references[payment.id]}
                  >
                    Confirmar Pago
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinanceManagement

