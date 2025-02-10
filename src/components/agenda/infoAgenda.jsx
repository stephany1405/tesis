import React, { useState, useEffect } from "react";
import styles from "./infoAgenda.module.css";
import axios from "axios";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import { useWebSocketContext } from "./WebSocketContext.jsx";

function InfoAgenda({ data }) {
  const [specialistStatuses, setSpecialistStatuses] = useState({});
  const [ratingMessages, setRatingMessages] = useState({});
  const [openIndex, setOpenIndex] = useState(null);

  const { ws, isConnected } = useWebSocketContext();

  // console.log("InfoAgenda renderizando.  isConnected:", isConnected, "ws:", ws);

  const handleMessage = (message) => {
    console.log("handleMessage llamado con:", message);
    if (message.type === "STATUS_UPDATE") {
      const appointmentId = Number(message.data.appointmentId);
      const specialistId = Number(message.data.specialistId);
      console.log(
        "Updating status:",
        appointmentId,
        specialistId,
        message.data.status
      );
      setSpecialistStatuses((prev) => {
        console.log("Previous specialistStatuses:", prev);
        const newState = {
          ...prev,
          [`${appointmentId}_${specialistId}`]: message.data.status,
        };
        console.log("New specialistStatuses:", newState);
        return newState;
      });
    }
  };

  useEffect(() => {
    if (isConnected && ws) {
      ws.onmessage = (e) => {
        try {
          const parsedMessage = JSON.parse(e.data);
          handleMessage(parsedMessage);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error, e.data);
        }
      };
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
      }
    };
  }, [isConnected, ws]);

  useEffect(() => {
    const fetchInitialStatuses = async () => {
      if (!data || data.length === 0) return;

      const statuses = {};
      for (const servicio of data) {
        for (const especialista of servicio.especialistas) {
          try {
            const response = await axios.get(
              `http://localhost:3000/api/servicios/especialista-estado/${servicio.id}/${especialista.id}`
            );
            const statusId = response.data.status;

            if (statusId) {
              const classificationResponse = await axios.get(
                `http://localhost:3000/api/servicios/classification/${statusId}`
              );
              statuses[`${servicio.id}_${especialista.id}`] =
                classificationResponse.data.classification_type ||
                "Sin clasificación";
            } else {
              statuses[`${servicio.id}_${especialista.id}`] =
                "Sin estado asignado";
            }
          } catch (error) {
            console.error("Error fetching initial status:", error);
            statuses[`${servicio.id}_${especialista.id}`] =
              "Sin estado asignado";
          }
        }
      }
      setSpecialistStatuses(statuses);
    };

    fetchInitialStatuses();
  }, [data]);

  const renderMap = (coordenadas) => {
    try {
      const coords = JSON.parse(coordenadas);
      return (
        <iframe
          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
          width="100%"
          height="200"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen=""
          aria-hidden="false"
          tabIndex="0"
        />
      );
    } catch (error) {
      return <p>Mapa no disponible</p>;
    }
  };

  const handleRating = async (appointmentId, specialistId, rating) => {
    try {
      const token = getJWT("token");
      const { id: userId, role_id } = jwtDecode(token);

      await axios.post(
        "http://localhost:3000/api/servicios/calificaciones/crear2",
        {
          appointmentId,
          rating,
          role: role_id,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSpecialistStatuses((prev) => ({
        ...prev,
        [`${appointmentId}_${specialistId}`]: "Final del servicio",
      }));

      const ratingKey = `${appointmentId}_${specialistId}`;
      setRatingMessages((prev) => ({
        ...prev,
        [ratingKey]: `¡Calificación de ${rating} estrellas enviada correctamente!`,
      }));

      setTimeout(() => {
        setRatingMessages((prev) => ({
          ...prev,
          [ratingKey]: null,
        }));
      }, 3000);
    } catch (error) {
      console.error("Error rating specialist:", error);
      alert("No se pudo guardar la calificación. Intente nuevamente.");
    }
  };

  const toggleContent = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!data || data.length === 0) return null;

  const servicios = data.map((item) => {
    if (
      item.servicios &&
      Array.isArray(item.servicios) &&
      item.servicios.length > 0
    ) {
      return item.servicios.map((servicio) => servicio.title);
    } else {
      return [];
    }
  });

  return (
    <div className={styles.mainContainer}>
      {data.map((servicio, serviceIndex) => (
        <div key={servicio.id} className={styles.contentLayout}>
          <div className={styles.section}>
            <h2
              className={styles.sectionTitle}
              onClick={() => toggleContent(serviceIndex)}
            >
              {servicios[serviceIndex].join(", ")}
            </h2>
            {openIndex === serviceIndex && (
              <div
                className={`${styles.sectionContent} ${
                  openIndex === serviceIndex ? styles.open : styles.closed
                }`}
              >
                <div className={styles.servicesSection}>
                  <h3 className={styles.subsectionTitle}>
                    Servicios Reservados:
                  </h3>
                  {servicio.servicios.map((item, index) => (
                    <div key={index} className={styles.serviceItem}>
                      <div className={styles.infoGroup}>
                        <p className={styles.infoLabel}>
                          Servicio {index + 1}:
                        </p>
                        <p className={styles.infoValue}>{item.title}</p>
                      </div>
                      <div className={styles.serviceDetails}>
                        <p>Duración: {item.duration}</p>
                        <p>Precio: ${item.price}</p>
                        {item.note && <p>Nota: {item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>Fecha y Hora:</p>
                  <p className={styles.infoValue}>
                    {servicio.fecha.start} - {servicio.fecha.end} (
                    {servicio.fecha.duration})
                  </p>
                </div>

                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>Ubicación:</p>
                  <p className={styles.infoValue}>{servicio.ubicacion}</p>
                </div>

                <div className={styles.mapContainer}>
                  <p className={styles.infoLabel}>Ubicación en Mapa:</p>
                  {renderMap(servicio.coordenadas)}
                </div>

                <div className={styles.specialistSection}>
                  <h3 className={styles.subsectionTitle}>Especialistas:</h3>
                  <div className={styles.specialistsContainer}>
                    {servicio.especialistas.map((especialista, index) => {
                      const specialistKey = `${servicio.id}_${especialista.id}`;
                      const currentStatus =
                        specialistStatuses[specialistKey] ||
                        "Especialista asignado";

                      return (
                        <div key={index} className={styles.specialistInfo}>
                          <img
                            src={
                              especialista.picture_profile
                                ? `http://localhost:3000${especialista.picture_profile}`
                                : "https://cdn-icons-png.flaticon.com/512/2920/2920072.png"
                            }
                            alt={`${especialista.name} ${especialista.lastname}`}
                            className={styles.specialistPhoto}
                          />
                          <div className={styles.specialistDetails}>
                            <p className={styles.specialistName}>
                              {especialista.name} {especialista.lastname}
                            </p>
                            <p className={styles.specialistPhone}>
                              Tel: {especialista.telephone_number}
                            </p>
                            <p className={styles.specialistRating}>
                              Calificación: {especialista.score || "N/A"} ★
                            </p>
                            <p className={styles.specialistStatus}>
                              Estado: {currentStatus}
                            </p>
                            {currentStatus === "Final del servicio" && (
                              <div className={styles.ratingSection}>
                                <p>Califica tu experiencia:</p>
                                <div className={styles.ratingStars}>
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <span
                                      key={rating}
                                      onClick={() =>
                                        handleRating(
                                          servicio.id,
                                          especialista.id,
                                          rating
                                        )
                                      }
                                      className={`${styles.ratingStar}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                {ratingMessages[specialistKey] && (
                                  <p className={styles.ratingSuccessMessage}>
                                    {ratingMessages[specialistKey]}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default InfoAgenda;
