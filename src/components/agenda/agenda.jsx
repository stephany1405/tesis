import React, { useState, useEffect } from "react";
import styles from "./Agenda.module.css";
import InfoAgenda from "./infoAgenda";
import Historial from "./Historial";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function Agenda() {
  const [activeTab, setActiveTab] = useState("status");
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchActiveServices = async () => {
      try {
        const token = getJWT("token");
        const decodedToken = jwtDecode(token);
        const id = Number.parseInt(decodedToken.id);
        const response = await axios.get(
          `${API_URL}/api/servicios/agenda/activo?userID=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        console.log(data);
        if (data && typeof data === "object" && !Array.isArray(data)) {
          const servicioFormateado = {
            id: data.id,
            servicios: data.services,
            fecha: data.scheduled_date,
            hora: data.start_appointment,
            duracionTotal: data.end_appointment,
            ubicacion: data.address,
            coordenadas: data.coordenadas,
            formaPago: data.payment_method_name,
            monto: data.amount,
            estado: data.status_name,
            referenciaPago: data.reference_payment,
            especialistas: data.specialists || [],
          };
          setServiciosActivos([servicioFormateado]);
        } else if (Array.isArray(data) && data.length > 0) {
          const serviciosFormateados = data.map((servicio) => ({
            id: servicio.id,
            servicios: servicio.services,
            fecha: servicio.scheduled_date,
            hora: servicio.start_appointment,
            duracionTotal: servicio.end_appointment,
            ubicacion: servicio.address,
            coordenadas: servicio.coordenadas,
            formaPago: servicio.payment_method_name,
            monto: servicio.amount,
            estado: servicio.status_name,
            referenciaPago: servicio.reference_payment,
            especialistas: servicio.specialists || [],
          }));
          setServiciosActivos(serviciosFormateados);
        } else {
          setServiciosActivos([]);
        }
      } catch (err) {
        setError("Error al cargar los servicios activos");
        console.error("Error detalles:", err);
        if (err.response && err.response.status === 404) {
          setServiciosActivos([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActiveServices();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "agenda":
        return <InfoAgenda data={serviciosActivos} />;
      case "historial":
        return <Historial />;
      default:
        return null;
    }
  };

  if (loading)
    return <div className={styles.loadingContainer}>Cargando...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  const hasActiveServices =
    serviciosActivos.length > 0 &&
    serviciosActivos.every((servicio) => servicio.id !== undefined);

  if (!hasActiveServices) {
    return (
      <div className={styles.noActiveServicesContainer}>
        No hay servicios activos
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "agenda" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("agenda")}
        >
          Información de agenda
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "historial" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("historial")}
        >
          Historial
        </button>
      </div>
      <div className={styles.contentContainer}>{renderContent()}</div>
    </div>
  );
}

export default Agenda;
