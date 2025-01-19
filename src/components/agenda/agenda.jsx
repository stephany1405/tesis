import React, { useState, useEffect } from "react";
import styles from "./Agenda.module.css";
import Status from "./status";
import Historial from "./historial";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function Agenda() {
  const [selectedHistorialService, setSelectedHistorialService] =
    useState(null);
  const [servicioActivo, setServicioActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);
  
  const scrollToHistorial = () => {
    const historialSection = document.querySelector(`.${styles.rightColumn}`);
    if (historialSection) {
      historialSection.scrollIntoView({ behavior: "smooth" });
    }
    setShowHistorial(true);
  };

  const API_URL = "http://localhost:3000";
  useEffect(() => {
    const fetchActiveService = async () => {
      try {
        const token = getJWT("token");
        const decodedToken = jwtDecode(token);
        const id = parseInt(decodedToken.id);
        const response = await axios.get(
          `${API_URL}/api/servicios/agenda/activo?userID=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        if (data.status_order) {
          setServicioActivo({
            servicios: data.services,
            fecha: data.scheduled_date.start,
            hora: data.scheduled_date.start.split(", ")[2],
            duracionTotal: data.scheduled_date.duration,
            ubicacion: data.address,
            formaPago: data.payment_method,
            monto: data.amount,
            estado: data.status_id,
            referenciaPago: data.reference_payment,
            especialista: {
              nombre: data.specialist_name,
              foto: data.specialist_photo
                ? `${API_URL}${data.specialist_photo}`
                : "/placeholder.svg?height=50&width=50",
              calificacion: data.specialist_rating,
            },
          });
        } else {
          setServicioActivo(null);
        }
      } catch (err) {
        setError("Error al cargar el servicio activo");
        console.error("Error detalles:", err);
        if (err.response && err.response.status === 404) {
          setServicioActivo(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActiveService();
  }, []);

  if (loading)
    return <div className={styles.loadingContainer}>Cargando...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!servicioActivo)
    return (
      <div className={styles.noActiveServicesContainer}>
        No hay servicios activos
      </div>
    );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Servicios activos</h2>
            <div className={styles.sectionContent}>
              <Status data={servicioActivo} />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Información de agenda</h2>
            <div className={styles.sectionContent}>
              <div className={styles.servicesSection}>
                <h3 className={styles.subsectionTitle}>
                  Servicios Reservados:
                </h3>
                {servicioActivo.servicios.map((servicio, index) => (
                  <div key={servicio.id} className={styles.serviceItem}>
                    <div className={styles.infoGroup}>
                      <p className={styles.infoLabel}>Servicio {index + 1}:</p>
                      <p className={styles.infoValue}>{servicio.title}</p>
                    </div>
                    <div className={styles.serviceDetails}>
                      <p>Duración: {servicio.duration}</p>
                      <p>Precio: ${servicio.price}</p>
                      {servicio.note && <p>Nota: {servicio.note}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Duración Total:</p>
                <p className={styles.infoValue}>
                  {servicioActivo.duracionTotal}
                </p>
              </div>

              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Fecha y Hora:</p>
                <p className={styles.infoValue}>{servicioActivo.fecha}</p>
              </div>

              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Ubicación:</p>
                <p className={styles.infoValue}>{servicioActivo.ubicacion}</p>
              </div>

              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Estado:</p>
                <p className={styles.infoValue}>{servicioActivo.estado}</p>
              </div>

              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Forma de Pago:</p>
                <p className={styles.infoValue}>{servicioActivo.formaPago}</p>
              </div>

              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Monto Total:</p>
                <p className={styles.infoValue}>{servicioActivo.monto}</p>
              </div>

              {servicioActivo.referenciaPago && (
                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>Referencia de Pago:</p>
                  <p className={styles.infoValue}>
                    {servicioActivo.referenciaPago}
                  </p>
                </div>
              )}

              <div className={styles.specialistSection}>
                <h3 className={styles.subsectionTitle}>Especialista:</h3>
                <div className={styles.specialistInfo}>
                  {servicioActivo.especialista.foto && (
                    <img
                      src={servicioActivo.especialista.foto}
                      alt={servicioActivo.especialista.nombre}
                      className={styles.specialistPhoto}
                    />
                  )}
                  <div className={styles.specialistDetails}>
                    <p className={styles.specialistName}>
                      {servicioActivo.especialista.nombre}{" "}
                      {servicioActivo.especialista.apellido}
                    </p>
                    <p className={styles.specialistRating}>
                      Calificación: {servicioActivo.especialista.calificacion} ★
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Historial de servicios</h2>
            <div className={styles.sectionContent}>
              <Historial setSelectedService={setSelectedHistorialService} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Agenda;
