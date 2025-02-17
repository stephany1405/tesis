import React, { useState, useEffect } from "react";
import styles from "./modal.module.css";
import { Star, Lock, Unlock, Trash2, UserX, Edit } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditSpecialistModal from "./editEspecialistModal.jsx";
const ClientModal = ({
  client,
  onClose,
  onBlockStatusChange,
  onDeleteClient,
  onUpdateClient,
}) => {
  const [isBlocked, setIsBlocked] = useState(client.status_user === false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setIsBlocked(!client.status_user);
  }, [client.status_user]);

  const handleLocationClick = (pointStr) => {
    try {
      let coords;

      if (typeof pointStr === "string") {
        try {
          coords = JSON.parse(pointStr);
        } catch (error) {
          const cleaned = pointStr.replace(/'/g, '"');
          coords = JSON.parse(cleaned);
        }
      } else {
        coords = pointStr;
      }

      if (coords) {
        const lat = coords.lat || coords.latitud;
        const lng = coords.lng || coords.longitud;

        if (lat !== undefined && lng !== undefined) {
          const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          window.open(url, "_blank");
        } else {
          console.error("Coordenadas invalidas.", coords);
        }
      } else {
        console.error("Formato de punto inválido:", pointStr);
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
  const deleteSpecialist = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/eliminar-usuario/${client.specialist_id}`
      );
      toast.success("Usuario eliminado exitosamente", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      if (typeof onDeleteClient === "function") {
        onDeleteClient(client.specialist_id);
      }
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast.error("Error al eliminar usuario", {
        position: "top-right",
      });
    }
  };

  const handleUpdateClient = (updatedClient) => {
    if (typeof onUpdateClient === "function") {
      onUpdateClient(updatedClient);
    }
  };
  const parseSpecialties = (specialtiesString) => {
    try {
      if (!specialtiesString) {
        return "Sin especialidades";
      }
      let cleanedString = specialtiesString.replace(/[{}]/g, "");
      cleanedString = cleanedString.replace(/"/g, "");
      const specialtiesArray = cleanedString.split(",").map((s) => s.trim());
      return specialtiesArray.join(", ");
    } catch (error) {
      console.error("Error al parsear specialist_specialty:", error);
      return "Error al cargar especialidades";
    }
  };
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <ToastContainer position="top-right" autoClose={2000} />

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
          <p>
            <strong>Especialidades:</strong>{" "}
            {parseSpecialties(client.specialist_specialty)}
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
          <button onClick={deleteSpecialist} className={styles.deleteButton}>
            <UserX size={14} /> Eliminar Especialista
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className={styles.editButton}
          >
            <Edit size={14} /> Editar Cliente
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
      {showEditModal && (
        <EditSpecialistModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onUpdateClient={handleUpdateClient}
        />
      )}
    </div>
  );
};

export default ClientModal;
