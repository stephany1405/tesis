import React, { useState, useEffect } from "react";
import styles from "./modal.module.css";
import { Star, Lock, Unlock, Trash2 } from "lucide-react";
import axios from "axios";

const ClientModal = ({ client, onClose, onBlockStatusChange }) => {
  const [isBlocked, setIsBlocked] = useState(client.status_user === false);

  useEffect(() => {
    setIsBlocked(!client.status_user);
  }, [client.status_user]);

  const handleLocationClick = (point) => {
    try {
      const coords = typeof point === "string" ? JSON.parse(point) : point;
      if (coords && coords.lat && coords.lng) {
        const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
        window.open(url, "_blank");
      } else {
        console.error("Coordenadas invalidas.");
      }
    } catch (error) {
      console.error("Error localización", error);
    }
  };

  const blockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/bloqueo-usuario", {
        id: client.specialist_id,
      });
      setIsBlocked(true);
      onBlockStatusChange(client.specialist_id, true);
    } catch (error) {
      console.error("Error bloqueando cliente", error);
    }
  };

  const unblockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/desbloqueo-usuario", {
        id: client.specialist_id,
      });
      setIsBlocked(false);
      onBlockStatusChange(client.specialist_id, false);
    } catch (error) {
      console.error("Error desbloqueando cliente", error);
    }
  };

  const parseAppointmentServices = (servicesString) => {
    try {
      return JSON.parse(servicesString || "[]");
    } catch (error) {
      console.error("Error parsing appointment services:", error);
      return [];
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "N/A";

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "p. m." : "a. m.";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedTime = `${hours}:${
        minutes < 10 ? "0" + minutes : minutes
      } ${ampm}`;
      return formattedTime;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "N/A";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const parsedDate = JSON.parse(dateString);
      const startDate = parsedDate.start;
      if (!startDate) return "N/A";

      const parts = startDate.split(",");
      if (parts.length < 2) return "N/A";

      return parts[1].trim();
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "N/A";
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${
          isBlocked ? styles.blockedContent : ""
        }`}
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
            className={`${styles.clientImage} ${
              isBlocked ? styles.blockedImage : ""
            }`}
          />
          <div>
            <h2 className={isBlocked ? styles.blockedUser : ""}>
              {client.specialist_name} {client.specialist_lastname}
              <span className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < (Number.parseFloat(client.specialist_rating) || 0)
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                    size={16}
                  />
                ))}
              </span>
            </h2>
            {isBlocked && (
              <span className={styles.blockedStatus}>Bloqueado</span>
            )}
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
              {client.appointments && client.appointments.length > 0 ? (
                client.appointments.map((appointment, index) => {
                  const services = parseAppointmentServices(
                    appointment.appointment_services
                  );

                  return (
                    <React.Fragment key={index}>
                      {services.map((service, serviceIndex) => (
                        <tr key={`${index}-${serviceIndex}`}>
                          {serviceIndex === 0 && (
                            <td rowSpan={services.length}>
                              {/*  Llama a formatDate con la cadena JSON completa */}
                              {formatDate(appointment.service_date)}
                            </td>
                          )}
                          <td>{service.title}</td>
                          <td>
                            $
                            {parseFloat(
                              appointment.specialist_earnings
                            ).toFixed(2)}
                          </td>
                          {serviceIndex === 0 && (
                            <td rowSpan={services.length}>
                              {client.specialist_name}{" "}
                              {client.specialist_lastname}
                            </td>
                          )}
                          <td>{formatTime(appointment.service_start_time)}</td>
                          <td>{formatTime(appointment.service_end_time)}</td>
                          <td>
                            <button
                              onClick={() =>
                                handleLocationClick(appointment.service_point)
                              }
                              disabled={!appointment.service_point}
                              className={styles.locationButton}
                            >
                              Ubicación
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No hay servicios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
