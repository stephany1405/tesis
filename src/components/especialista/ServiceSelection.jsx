import React, { useState } from "react";
import styles from "./ServiceSelection.module.css";

const ServiceSelection = ({ services, onAccept }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState(0);

  const totalSessions = services.reduce((total, service) => {
    return total + service.quantity;
  }, 0);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedSessions(0);
  };

  const handleSessionsChange = (e) => {
    setSelectedSessions(parseInt(e.target.value));
  };

  const handleAccept = async () => {
    if (!selectedService || selectedSessions <= 0) return;

    try {
      await onAccept({
        serviceId: selectedService.id,
        sessions: selectedSessions,
      });
      setSelectedService(null);
      setSelectedSessions(0);
    } catch (error) {
      console.error("Error al aceptar el servicio:", error);
    }
  };

  return (
    <div className={styles.selectionContainer}>
      <h3 className={styles.selectionTitle}>Selección de Servicios</h3>
      <p className={styles.totalSessions}>Total de sesiones: {totalSessions}</p>

      <div className={styles.serviceGrid}>
        {services.map((service) => (
          <div
            key={service.id}
            className={`${styles.serviceCard} ${
              selectedService?.id === service.id ? styles.selected : ""
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <h4>{service.title}</h4>
            <p>Sesiones disponibles: {service.quantity}</p>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className={styles.sessionSelector}>
          <label>Número de sesiones a tomar</label>
          <input
            type="number"
            min="1"
            max={selectedService.quantity}
            value={selectedSessions}
            onChange={handleSessionsChange}
          />
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={!selectedService || selectedSessions <= 0}
        className={styles.acceptButton}
      >
        Aceptar Servicio
      </button>
    </div>
  );
};

export default ServiceSelection;
