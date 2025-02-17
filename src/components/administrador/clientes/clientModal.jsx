import React, { useState, useEffect } from "react";
import styles from "./clientModal.module.css";
import { Star, Lock, Unlock, UserX, Edit } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditClientModal from "./editClientModal.jsx";

const ClientModal = ({ client, onClose, onDeleteClient, onUpdateClient }) => {
  const [isBlocked, setIsBlocked] = useState(client.status_user === false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(client);

  useEffect(() => {
    setIsBlocked(currentClient.status_user === false);
  }, [currentClient.status_user]);

  const blockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/bloqueo-usuario", {
        id: currentClient.id,
      });
      setIsBlocked(true);
      setCurrentClient((prev) => ({ ...prev, status_user: false }));
    } catch (error) {
      console.error("Error bloqueando cliente", error);
    }
  };

  const unblockClient = async () => {
    try {
      await axios.put("http://localhost:3000/api/desbloqueo-usuario", {
        id: currentClient.id,
      });
      setIsBlocked(false);
      setCurrentClient((prev) => ({ ...prev, status_user: true }));
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

  const deleteClient = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/eliminar-usuario/${currentClient.id}`
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
        onDeleteClient(currentClient.id);
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
    setCurrentClient(updatedClient);
    if (typeof onUpdateClient === "function") {
      onUpdateClient(updatedClient);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <div className={styles.clientHeader}>
          <img
            src={
              currentClient.picture_profile
                ? `http://localhost:3000${currentClient.picture_profile}`
                : `https://i.pravatar.cc/300?img=${currentClient.id}`
            }
            alt={`${currentClient.name} ${currentClient.lastname}`}
            className={styles.clientImage}
          />
          <h2>
            {currentClient.name} {currentClient.lastname}
            <span className={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < (parseFloat(currentClient.score) || 0)
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
                {currentClient.identification}
              </div>
              <div className={styles.infoItem}>
                <strong>Teléfono:</strong>
                {currentClient.telephone_number}
              </div>
              <div className={styles.infoItem}>
                <strong>Correo:</strong>
                {currentClient.email}
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
            <button onClick={deleteClient} className={styles.deleteUser}>
              <UserX size={14} /> Eliminar Cliente
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className={styles.editButton}
            >
              <Edit size={14} /> Editar Cliente
            </button>
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
                {currentClient.serviceHistory &&
                currentClient.serviceHistory.length > 0 &&
                currentClient.serviceHistory[0].service !== "N/A" ? (
                  currentClient.serviceHistory.map((service, index) => {
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

      {showEditModal && (
        <EditClientModal
          client={currentClient}
          onClose={() => setShowEditModal(false)}
          onUpdateClient={handleUpdateClient}
        />
      )}
    </div>
  );
};

export default ClientModal;
