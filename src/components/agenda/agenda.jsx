import { useState, useEffect } from "react";
import styles from "./Agenda.module.css";
import InfoAgenda from "./infoAgenda";
import Historial from "./Historial";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function Agenda() {
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // Añadido nuevo estado

  useEffect(() => {
    const fetchActiveServices = async () => {
      try {
        const token = getJWT("token");
        const decodedToken = jwtDecode(token);
        const id = Number.parseInt(decodedToken.id);
        const response = await axios.get(
          `http://localhost:3000/api/servicios/agenda/activo?userID=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setServiciosActivos([formatService(data)]);
        } else if (Array.isArray(data) && data.length > 0) {
          setServiciosActivos(data.map(formatService));
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

  const formatService = (servicio) => ({
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
  });

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowHistorial(false); 
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
        <Historial setSelectedService={handleServiceSelect} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showHistorial ? (
        <Historial setSelectedService={handleServiceSelect} />
      ) : (
        <>
          <InfoAgenda
            data={selectedService ? [selectedService] : serviciosActivos}
          />
          <button
            className={styles.historialButton}
            onClick={() => setShowHistorial(true)}
          >
            Ver Historial
          </button>
        </>
      )}
    </div>
  );
}

export default Agenda;
