"use client"

import { useState, useEffect } from "react"
import styles from "./modal.module.css"
import { Star, Lock, Unlock, Trash2 } from "lucide-react"
import axios from "axios"

const ClientModal = ({ client, onClose, onBlockStatusChange }) => {
  const [isBlocked, setIsBlocked] = useState(client.is_blocked || false)

  useEffect(() => {
    setIsBlocked(client.is_blocked || false)
  }, [client.is_blocked])

  const handleLocationClick = (service) => {
    try {
      const point = service.point ? JSON.parse(service.point) : null
      if (point && point.lat && point.lng) {
        const url = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`
        window.open(url, "_blank")
      } else {
        console.error("Invalid location coordinates")
      }
    } catch (error) {
      console.error("Error parsing location", error)
    }
  }

  const blockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/bloqueo-usuario", {
        id: client.id,
      })
      setIsBlocked(true)
      onBlockStatusChange(client.id, true)
    } catch (error) {
      console.error("Error bloqueando cliente", error)
    }
  }

  const unblockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/desbloqueo-usuario", {
        id: client.id,
      })
      setIsBlocked(false)
      onBlockStatusChange(client.id, false)
    } catch (error) {
      console.error("Error desbloqueando cliente", error)
    }
  }

  const parseAppointmentServices = (servicesString) => {
    try {
      return JSON.parse(servicesString || "[]")
    } catch (error) {
      return []
    }
  }

  const serviceHistory = client.appointment_services
    ? parseAppointmentServices(client.appointment_services).map((service) => ({
        date: client.service_date ? JSON.parse(client.service_date).start : "N/A",
        service: service.title,
        price: `$${service.price}`,
        especialista: `${client.specialist_name} ${client.specialist_lastname}`,
        startTime: client.service_date ? JSON.parse(client.service_date).start.split(", ")[2] : "N/A",
        endTime: client.service_date ? JSON.parse(client.service_date).end : "N/A",
        address: client.service_address || "N/A",
        point: client.service_point || "N/A",
        rating: client.service_rating || "N/A",
      }))
    : []

  const handleDelete = () => {
    console.log("Delete client:", client.specialist_id)
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${isBlocked ? styles.blockedContent : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.clientHeader}>
          <img
            src={
              client.specialist_image
                ? `http://localhost:3000${client.specialist_image}`
                : `https://i.pravatar.cc/300?img=${client.id}`
            }
            alt={`${client.specialist_name} ${client.specialist_lastname}`}
            className={`${styles.clientImage} ${isBlocked ? styles.blockedImage : ""}`}
          />
          <div>
            <h2 className={isBlocked ? styles.blockedUser : ""}>
              {client.specialist_name} {client.specialist_lastname}
              <span className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < (Number.parseFloat(client.specialist_rating) || 0) ? styles.starFilled : styles.starEmpty
                    }
                    size={16}
                  />
                ))}
              </span>
            </h2>
            {isBlocked && <span className={styles.blockedStatus}>Bloqueado</span>}
          </div>
        </div>
        <div className={styles.clientInfo}>
          <p>
            <strong>Identificación:</strong> {client.specialist_identification}
          </p>
          <p>
            <strong>Teléfono:</strong> {client.specialist_phone}
          </p>
          <p>
            <strong>Correo:</strong> {client.specialist_email}
          </p>
          <p>
            <strong>Especialidad:</strong> {client.specialist_specialty || "N/A"}
          </p>
        </div>
        <div className={styles.actionButtons}>
          {!isBlocked ? (
            <button onClick={blockClient} className={styles.blockButton}>
              <Lock size={16} /> Bloquear
            </button>
          ) : (
            <button onClick={unblockClient} className={styles.unblockButton}>
              <Unlock size={16} /> Desbloquear
            </button>
          )}
          <button onClick={handleDelete} className={styles.deleteButton}>
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
        <div className={styles.serviceHistory}>
          <h3>Historial de Servicios</h3>
          <table className={styles.serviceTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Ganancia</th>
                <th>Especialista</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {serviceHistory.map((service, index) => (
                <tr key={index}>
                  <td>{service.date}</td>
                  <td>{service.service}</td>
                  <td>{service.price}</td>
                  <td>{service.especialista}</td>
                  <td>{service.startTime}</td>
                  <td>{service.endTime}</td>
                  <td>
                    <button
                      onClick={() => handleLocationClick(service)}
                      disabled={!service.point}
                      className={styles.locationButton}
                    >
                      Ubicación
                    </button>
                  </td>
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

