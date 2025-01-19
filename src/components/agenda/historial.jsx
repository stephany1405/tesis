import React from "react"
import styles from "./historial.module.css"

const serviceHistory = [
  {
    id: 1,
    nombre: "Tratamiento facial rejuvenecedor",
    fecha: "15 de abril de 2023",
    duracion: "60 minutos",
    descripcion:
      "Tratamiento intensivo que combina limpieza profunda, exfoliación, mascarilla nutritiva y masaje facial para revitalizar y rejuvenecer la piel.",
    ubicacion: "Calle Principal 123, Local 4, Ciudad",
    formaPago: "Tarjeta de Crédito",
    especialista: {
      nombre: "María González",
      foto: "/placeholder.svg?height=50&width=50",
      calificacion: 4.8,
    },
  },
  {
    id: 2,
    nombre: "Masaje relajante",
    fecha: "10 de abril de 2023",
    duracion: "45 minutos",
    descripcion: "Masaje corporal completo diseñado para aliviar la tensión y promover la relajación.",
    ubicacion: "Calle Principal 123, Local 4, Ciudad",
    formaPago: "Efectivo",
    especialista: {
      nombre: "Carlos Rodríguez",
      foto: "/placeholder.svg?height=50&width=50",
      calificacion: 4.9,
    },
  },
  {
    id: 3,
    nombre: "Manicura y pedicura",
    fecha: "5 de abril de 2023",
    duracion: "90 minutos",
    descripcion: "Tratamiento completo para manos y pies, incluyendo exfoliación, masaje y aplicación de esmalte.",
    ubicacion: "Calle Principal 123, Local 4, Ciudad",
    formaPago: "Tarjeta de Débito",
    especialista: {
      nombre: "Ana Martínez",
      foto: "/placeholder.svg?height=50&width=50",
      calificacion: 4.7,
    },
  },
]

function Historial({ setSelectedService }) {
  return (
    <div className={styles.historyList}>
      {serviceHistory.map((service) => (
        <div key={service.id} className={styles.historyItem} onClick={() => setSelectedService(service)}>
          <p className={styles.serviceName}>{service.nombre}</p>
          <p className={styles.serviceDate}>{service.fecha}</p>
        </div>
      ))}
    </div>
  )
}

export default Historial

