import React, { useEffect, useState } from "react";
import Status from "./status";
import styles from "./serviceStatus.module.css";
import axios from "axios";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
function ServicesStatus() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedServices();
  }, []);

  const loadAssignedServices = async () => {
    try {
      const token = getJWT("token");
      const decodedToken = jwtDecode(token);
      const specialistId = decodedToken.id;

      const response = await axios.get(
        `http://localhost:3000/api/servicios/servicios-asignados/${specialistId}`
      );

      setServices(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    await loadAssignedServices();
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const parseJson = (jsonString) => {
    try {
      return typeof jsonString === "string"
        ? JSON.parse(jsonString)
        : jsonString;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  };

  if (loading) return <div>Cargando servicios...</div>;
  console.log(services);
  if (!services.length) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Estado de los Servicios Aceptados</h2>
        <p>No tienes servicios asignados actualmente.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Estado de los Servicios Aceptados</h2>
      <ul className={styles.serviceList}>
        {services.map((appointment) => {
          const parsedServices = parseJson(appointment.services);
          const parsedScheduledDate = parseJson(appointment.scheduled_date);
          const parsedPoint = parseJson(appointment.point);

          return (
            <li key={appointment.appointment_id} className={styles.serviceItem}>
              <div className={styles.clientInfo}>
                <h3>
                  {appointment.client_name} {appointment.client_lastname}
                </h3>
                <p>Teléfono: {appointment.client_phone}</p>
                <p>Dirección: {appointment.address}</p>
                <p>Fecha: {parsedScheduledDate.start}</p>
                <div className={styles.locationInfo}>
                  <p>Ubicación:</p>
                  <button
                    onClick={() =>
                      openGoogleMaps(parsedPoint.lat, parsedPoint.lng)
                    }
                    className={styles.gpsButton}
                  >
                    GPS
                  </button>
                </div>
              </div>
              <div className={styles.serviceDetails}>
                {appointment.assigned_services.map((assignedService, index) => {
                  return (
                    <div key={index} className={styles.service}>
                      <h4>
                        {assignedService.service_title ||
                          "Servicio desconocido"}
                      </h4>
                      <p>
                        Sesiones asignadas: {assignedService.sessions_assigned}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Status
                data={{
                  appointment_id: appointment.appointment_id,
                  client_name: appointment.client_name,
                  client_lastname: appointment.client_lastname,
                  client_phone: appointment.client_phone,
                }}
                onStatusUpdate={handleStatusUpdate}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ServicesStatus;
