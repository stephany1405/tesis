import React from "react"
import Status from "./status"
import styles from "./serviceStatus.module.css"

const servicesData = [
  {
    id: 1,
    servicio: "Epilación",
    especialista: {
      nombre: "Ana",
      apellido: "García",
      calificacion: 4.8,
      foto: "/placeholder.svg?height=50&width=50",
    },
  },
  {
    id: 2,
    servicio: "Masaje",
    especialista: {
      nombre: "Carlos",
      apellido: "Rodríguez",
      calificacion: 4.9,
      foto: "/placeholder.svg?height=50&width=50",
    },
  },
  {
    id: 3,
    servicio: "Limpieza facial",
    especialista: {
      nombre: "Laura",
      apellido: "Martínez",
      calificacion: 4.7,
      foto: "/placeholder.svg?height=50&width=50",
    },
  },
]

function ServicesStatus() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Estado de los Servicios Aceptados</h2>
        <ul className={styles.serviceList}>
          {servicesData.map((service) => (
            <li key={service.id} className={styles.serviceItem}>
              <h3 className={styles.serviceName}>{service.servicio}</h3>
              <Status data={service} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ServicesStatus

