import React from "react"
import styles from "./notificaciones.module.css"

export default function Notificaciones() {
  const notifications = [
    {
      id: 1,
      servicio: "Epilación",
      duracion: "2 horas",
      fechaHora: "2023-05-20 14:00",
      ubicacion: "Calle Principal 123, Ciudad",
      formaPago: "Tarjeta de crédito",
      montoTotal: "$50.00",
      nota: "Por favor, traer productos de limpieza ecológicos",
      referenciaPago: "REF123456",
      cliente: {
        nombre: "Juan Pérez",
        telefono: "+1234567890",
      },
    },
    {
      id: 2,
      servicio: "Masaje",
      duracion: "3 horas",
      fechaHora: "2023-05-21 10:00",
      ubicacion: "Avenida Central 456, Ciudad",
      formaPago: "Efectivo",
      montoTotal: "$75.00",
      nota: "El perro necesita un paseo de 30 minutos",
      referenciaPago: "REF789012",
      cliente: {
        nombre: "María González",
        telefono: "+0987654321",
      },
    },
    {
      id: 3,
      servicio: "Limpieza facial",
      duracion: "1 hora",
      fechaHora: "2023-05-22 15:30",
      ubicacion: "Plaza Mayor 789, Ciudad",
      formaPago: "Transferencia bancaria",
      montoTotal: "$60.00",
      nota: "Alergias: nueces",
      referenciaPago: "REF345678",
      cliente: {
        nombre: "Carlos Rodríguez",
        telefono: "+1122334455",
      },
    },
    {
      id: 3,
      servicio: "Limpieza facial",
      duracion: "1 hora",
      fechaHora: "2023-05-22 15:30",
      ubicacion: "Plaza Mayor 789, Ciudad",
      formaPago: "Transferencia bancaria",
      montoTotal: "$60.00",
      nota: "Alergias: nueces",
      referenciaPago: "REF345678",
      cliente: {
        nombre: "Carlos Rodríguez",
        telefono: "+1122334455",
      },
    },
  ]

  const handleAceptarServicio = (id) => {
    console.log(`Servicio ${id} aceptado`)
    // Aquí puedes agregar la lógica para aceptar el servicio
  }

  const handleCancelarServicio = (id) => {
    console.log(`Servicio ${id} cancelado`)
    // Aquí puedes agregar la lógica para cancelar el servicio
  }

  return (
    <div className={styles.notifications}>
      <div className={styles.container}>
        <h2 className={styles.title}>Notificaciones de Servicios</h2>
        <ul className={styles.notificationList}>
          {notifications.map((notification) => (
            <li key={notification.id} className={styles.notificationItem}>
              <h3 className={styles.serviceName}>{notification.servicio}</h3>
              <p>
                <strong>Duración:</strong> {notification.duracion}
              </p>
              <p>
                <strong>Fecha y hora:</strong> {notification.fechaHora}
              </p>
              <p>
                <strong>Ubicación:</strong> {notification.ubicacion}
              </p>
              <p>
                <strong>Forma de pago:</strong> {notification.formaPago}
              </p>
              <p>
                <strong>Monto total:</strong> {notification.montoTotal}
              </p>
              <p>
                <strong>Nota:</strong> {notification.nota}
              </p>
              <p>
                <strong>Referencia de pago:</strong> {notification.referenciaPago}
              </p>
              <p>
                <strong>Cliente:</strong> {notification.cliente.nombre}
              </p>
              <p>
                <strong>Teléfono:</strong> {notification.cliente.telefono}
              </p>
              <div className={styles.buttonContainer}>
                <button className={styles.acceptButton} onClick={() => handleAceptarServicio(notification.id)}>
                  Aceptar
                </button>
                <button className={styles.cancelButton} onClick={() => handleCancelarServicio(notification.id)}>
                  Cancelar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

