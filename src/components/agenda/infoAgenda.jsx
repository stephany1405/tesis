import React, { useState } from "react";
import styles from "./infoAgenda.module.css";

function InfoAgenda({ data }) {
  if (!data || data.length === 0) return null;

  const [openIndex, setOpenIndex] = useState(null);
  const toggleContent = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.mainContainer}>
      {data.map((servicio, serviceIndex) => (
        <div key={servicio.id} className={styles.contentLayout}>
          <div className={styles.section}>
            <h2
              className={styles.sectionTitle}
              onClick={() => toggleContent(serviceIndex)}
            >
              Información de agenda #{serviceIndex + 1}
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
                  <p className={styles.infoLabel}>Duración Total:</p>
                  <p className={styles.infoValue}>{servicio.duracionTotal}</p>
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

                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>Estado:</p>
                  <p className={styles.infoValue}>{servicio.estado}</p>
                </div>

                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>Forma de Pago:</p>
                  <p className={styles.infoValue}>{servicio.formaPago}</p>
                </div>

                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>Monto Total:</p>
                  <p className={styles.infoValue}>${servicio.monto}</p>
                </div>

                {servicio.referenciaPago && (
                  <div className={styles.infoGroup}>
                    <p className={styles.infoLabel}>Referencia de Pago:</p>
                    <p className={styles.infoValue}>
                      {servicio.referenciaPago}
                    </p>
                  </div>
                )}

                <div className={styles.specialistSection}>
                  <h3 className={styles.subsectionTitle}>Especialistas:</h3>
                  <div className={styles.specialistsContainer}>
                    {servicio.especialistas.length === 0 ? (
                      <p>No asignado especialista</p>
                    ) : (
                      servicio.especialistas.map((especialista, index) => (
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
                          </div>
                        </div>
                      ))
                    )}
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
