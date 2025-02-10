import React, { useState, useEffect } from "react";
import styles from "./clientModal.module.css";
import { Star, Lock, Unlock, CloudCog } from "lucide-react";
import axios from "axios";

const ClientModal = ({ client, onClose }) => {
  const [isBlocked, setIsBlocked] = useState(client.status_user === false);

  useEffect(() => {
    setIsBlocked(client.status_user === false);
  }, [client.status_user]);

  const blockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/bloqueo-usuario", {
        id: client.id,
      });
      setIsBlocked(true);
    } catch (error) {
      console.error("Error bloqueando cliente", error);
    }
  };

  const unblockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/desbloqueo-usuario", {
        id: client.id,
      });
      setIsBlocked(false);
    } catch (error) {
      console.error("Error desbloqueando cliente", error);
    }
  };

  const handleLocationClick = (service) => {
    try {
      const point = JSON.parse(service.point);
      if (point && point.lat && point.lng) {
        const url = `https://www.google.com/maps/@?api=1&map_action=map&center=${point.lat},${point.lng}&zoom=15`;
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error localización", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;
    return formattedTime;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.clientHeader}>
          <img
            src={
              client.picture_profile
                ? `http://localhost:3000${client.picture_profile}`
                : `https://i.pravatar.cc/300?img=${client.id}`
            }
            alt={`${client.name} ${client.lastname}`}
            className={styles.clientImage}
          />
          <h2>
            {client.name} {client.lastname}
            <span className={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < (parseFloat(client.score) || 0)
                      ? styles.starFilled
                      : styles.starEmpty
                  }
                  size={16}
                />
              ))}
            </span>
            {isBlocked && (
              <span className={styles.blockedStatus}>Bloqueado</span>
            )}
          </h2>
        </div>
        <div className={styles.modalScrollContent}>
          <div className={styles.clientInfo}>
            <h3 className={styles.sectionTitle}>Información del Cliente</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>Identificación:</strong>
                {client.identification}
              </div>
              <div className={styles.infoItem}>
                <strong>Teléfono:</strong>
                {client.telephone_number}
              </div>
              <div className={styles.infoItem}>
                <strong>Correo:</strong>
                {client.email}
              </div>
            </div>
          </div>
          <div className={styles.actionButtons}>
            {!isBlocked ? (
              <button onClick={blockClient} className={styles.blockButton}>
                <Lock size={14} /> Bloquear
              </button>
            ) : (
              <button onClick={unblockClient} className={styles.unblockButton}>
                <Unlock size={14} /> Desbloquear
              </button>
            )}
          </div>
          <div className={styles.serviceHistory}>
            <h3 className={styles.sectionTitle}>Historial de Servicios</h3>
            <table className={styles.serviceTable}>
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Servicio</th>
                  <th>Monto</th>
                  <th>Especialista</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                  <th>Método Pago</th>
                  <th>Sesiones</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {client.serviceHistory &&
                client.serviceHistory.length > 0 &&
                client.serviceHistory[0].service !== "N/A" ? (
                  client.serviceHistory.map((service, index) => {
                    let parsedDate = service.date;
                    try {
                      const dateObj = JSON.parse(service.date);
                      parsedDate = dateObj.start || service.date;
                    } catch (e) {
                      parsedDate = service.date;
                    }

                    return (
                      <tr key={index}>
                        <td>{parsedDate || "N/A"}</td>
                        <td>{service.service}</td>
                        <td>{service.price || "N/A"}</td>
                        <td>{service.especialista}</td>
                        <td>{formatTime(service.startTime) || "N/A"}</td>
                        <td>{formatTime(service.endTime) || "N/A"}</td>
                        <td>{service.paymentMethod || "N/A"}</td>
                        <td>{service.sessions || "N/A"}</td>
                        <td>
                          <button
                            onClick={() => handleLocationClick(service)}
                            disabled={!service.point}
                          >
                            Ubicación
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Sin historial de servicios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
