import React, { useState, useEffect } from "react";
import styles from "./historial.module.css";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";

function Historial({ setSelectedService }) {
  const API_URL = "http://localhost:3000";
  const [servicioNoActivo, setServicioNoActivo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoActiveService = async () => {
      try {
        const token = getJWT("token");
        const decoded = jwtDecode(token);
        const id = Number.parseInt(decoded.id);
        const response = await fetch(
          `${API_URL}/api/servicios/agenda/noactivo?userID=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data) {
          setServicioNoActivo(data);
        }
      } catch (error) {
        setError("Error al cargar el servicio activo");
        console.error("Error detalles:", error);
        if (error.response && error.response.status === 404) {
          setServicioNoActivo(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNoActiveService();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!servicioNoActivo || servicioNoActivo.length === 0)
    return (
      <div className={styles.noHistory}>No hay historial de servicios</div>
    );

  return (
    <div className={styles.historyList}>
      {servicioNoActivo.map((service, index) => {
        const services = JSON.parse(service.services);
        const scheduledDate = JSON.parse(service.scheduled_date);
        return (
          <div
            key={index}
            className={styles.historyItem}
            onClick={() => setSelectedService(service)}
          >
            <div className={styles.serviceName}>{services[0]?.title}</div>
            <div className={styles.serviceDate}>
              {scheduledDate.start} - {scheduledDate.end}
            </div>
            <div className={styles.serviceDuration}>
              {scheduledDate.duration}
            </div>
            <div className={styles.paymentMethod}>
              <strong>Método de pago:</strong> {service.payment_method_name}
            </div>
            <div className={styles.serviceAddress}>
              <strong>Dirección:</strong> {service.address}
            </div>
            <div className={styles.serviceAmount}>
              <strong>Costo:</strong> {service.amount}
            </div>
            <div className={styles.serviceAmount}>
              <strong>Referencia de Pago:</strong> {service.payment_method_name}
            </div>

            <div className={styles.specialists}>
              <strong>Especialistas:</strong>
              <div className={styles.specialistList}>
                {service.specialists.map((specialist, idx) => (
                  <div key={idx} className={styles.specialistItem}>
                    <img
                      src={
                        specialist.picture_profile
                          ? `http://localhost:3000${specialist.picture_profile}`
                          : "/placeholder.svg"
                      }
                      alt={`${specialist.name} ${specialist.lastname}`}
                      className={styles.specialistImage}
                    />
                    <div className={styles.specialistName}>
                      {specialist.name} {specialist.lastname}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Historial;
