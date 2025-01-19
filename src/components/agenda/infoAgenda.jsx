import React from "react"
import styles from "./InfoAgenda.module.css"

function InfoAgenda({ data }) {
  if (!data) return null

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentLayout}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Información de agenda</h2>
          <div className={styles.sectionContent}>
            <div className={styles.servicesSection}>
              <h3 className={styles.subsectionTitle}>Servicios Reservados:</h3>
              {data.servicios.map((servicio, index) => (
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

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Duración Total:</p>
              <p className={styles.infoValue}>{data.duracionTotal}</p>
            </div>

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Fecha y Hora:</p>
              <p className={styles.infoValue}>{data.fecha}</p>
            </div>

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Ubicación:</p>
              <p className={styles.infoValue}>{data.ubicacion}</p>
            </div>

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Estado:</p>
              <p className={styles.infoValue}>{data.estado}</p>
            </div>

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Forma de Pago:</p>
              <p className={styles.infoValue}>{data.formaPago}</p>
            </div>

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Monto Total:</p>
              <p className={styles.infoValue}>{data.monto}</p>
            </div>

            {data.referenciaPago && (
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Referencia de Pago:</p>
                <p className={styles.infoValue}>{data.referenciaPago}</p>
              </div>
            )}

            <div className={styles.specialistSection}>
              <h3 className={styles.subsectionTitle}>Especialista:</h3>
              <div className={styles.specialistInfo}>
                {data.especialista.foto && (
                  <img
                    src={data.especialista.foto || "/placeholder.svg"}
                    alt={data.especialista.nombre}
                    className={styles.specialistPhoto}
                  />
                )}
                <div className={styles.specialistDetails}>
                  <p className={styles.specialistName}>
                    {data.especialista.nombre} {data.especialista.apellido}
                  </p>
                  <p className={styles.specialistRating}>Calificación: {data.especialista.calificacion} ★</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoAgenda

