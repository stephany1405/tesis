import React, { useState } from "react"
import styles from "./modal.module.css"
import { Star, Lock, Unlock, Trash2 } from "lucide-react"

const ClientModal = ({ client, onClose }) => {
  const [isBlocked, setIsBlocked] = useState(false)

  // This is mock data. In a real application, you would fetch this data based on the client.id
  const clientDetails = {
    ...client,
    identification: "1234567890",
    phone: "+1 234 567 8900",
    email: "cliente@example.com",
    rating: 4, // Add a rating property
    serviceHistory: [
      {
        date: "14-05-2024",
        service: "Manicura",
        price: "$30",
        especialista: "tu mama",
        startTime: "10:00",
        endTime: "11:30",
        address: "123 Main St, Anytown, AT 12345",

      },
      {
        date: "19-06-2004",
        service: "Pedicura",
        price: "$35",
        especialista: "tu abuela",
        startTime: "14:00",
        endTime: "15:30",
        address: "123 Main St, Anytown, AT 12345",

      },
      {
        date: "01-01-2025",
        service: "Diseño de uñas",
        price: "$40",
        especialista: "tu tia",
        startTime: "16:00",
        endTime: "17:30",
        address: "123 Main St, Anytown, AT 12345",
      },
    ],
  }

  const handleBlock = () => setIsBlocked(true)
  const handleUnblock = () => setIsBlocked(false)
  const handleDelete = () => {
    // Implement delete functionality here
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
          <p>
            <strong>Identificación:</strong> {clientDetails.identification}
          </p>
          <p>
            <strong>Teléfono:</strong> {clientDetails.phone}
          </p>
          <p>
            <strong>Correo:</strong> {clientDetails.email}
          </p>
          <p>
            <strong>Especialidad:</strong> {clientDetails.specialty}
          </p>
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
          <h3>Historial de Servicios</h3>
          <table className={styles.serviceTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Ganancia</th>
                <th>Cliente</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
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

