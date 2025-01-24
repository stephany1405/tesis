import React, { useState } from "react"
import styles from "./clientModal.module.css"
import { Star, Lock, Unlock, Trash2 } from "lucide-react"

const ClientModal = ({ client, onClose }) => {
  const [isBlocked, setIsBlocked] = useState(false)

  const clientDetails = {
    ...client,
    identification: "1234567890",
    phone: "+1 234 567 8900",
    email: "cliente@example.com",
    rating: 4,
    serviceHistory: [
      {
        date: "14-05-2024",
        service: "Manicura",
        price: "$30",
        especialista: "María López",
        startTime: "10:00",
        endTime: "11:30",
        paymentMethod: "Tarjeta de crédito",
        sessions: 1,
        address: "123 Main St, Anytown, AT 12345",
      },
      {
        date: "19-06-2024",
        service: "Pedicura",
        price: "$35",
        especialista: "Ana Gómez",
        startTime: "14:00",
        endTime: "15:30",
        paymentMethod: "Efectivo",
        sessions: 2,
        address: "456 Elm St, Othertown, OT 67890",
      },
      {
        date: "01-07-2024",
        service: "Diseño de uñas",
        price: "$40",
        especialista: "Laura Martínez",
        startTime: "16:00",
        endTime: "17:30",
        paymentMethod: "Transferencia bancaria",
        sessions: 1,
        address: "789 Oak St, Somewhere, SW 13579",
      },
    ],
  }

  const handleBlock = () => setIsBlocked(true)
  const handleUnblock = () => setIsBlocked(false)
  const handleDelete = () => {
    console.log("Delete client:", client.id)
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.clientHeader}>
          <img src={client.image || "/placeholder.svg"} alt={client.name} className={styles.clientImage} />
          <div>
            <h2>
              {clientDetails.name} {clientDetails.lastName}
              <span className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={i < clientDetails.rating ? styles.starFilled : styles.starEmpty} size={20} />
                ))}
              </span>
            </h2>
            {isBlocked && <span className={styles.blockedStatus}>Bloqueado</span>}
          </div>
        </div>
        <div className={styles.clientInfo}>
          <h3 className={styles.sectionTitle}>Información del Cliente</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>Identificación:</strong>
              {clientDetails.identification}
            </div>
            <div className={styles.infoItem}>
              <strong>Teléfono:</strong>
              {clientDetails.phone}
            </div>
            <div className={styles.infoItem}>
              <strong>Correo:</strong>
              {clientDetails.email}
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
          {!isBlocked ? (
            <button onClick={handleBlock} className={styles.blockButton}>
              <Lock size={16} /> Bloquear
            </button>
          ) : (
            <button onClick={handleUnblock} className={styles.unblockButton}>
              <Unlock size={16} /> Desbloquear
            </button>
          )}
          
        </div>
        <div className={styles.serviceHistory}>
          <h3 className={styles.sectionTitle}>Historial de Servicios</h3>
          <table className={styles.serviceTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Monto</th>
                <th>Especialista</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Método de Pago</th>
                <th>Sesiones</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {clientDetails.serviceHistory.map((service, index) => (
                <tr key={index}>
                  <td>{service.date}</td>
                  <td>{service.service}</td>
                  <td>{service.price}</td>
                  <td>{service.especialista}</td>
                  <td>{service.startTime}</td>
                  <td>{service.endTime}</td>
                  <td>{service.paymentMethod}</td>
                  <td>{service.sessions}</td>
                  <td>{service.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ClientModal

