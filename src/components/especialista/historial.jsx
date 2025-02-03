import { useEffect, useState } from "react"
import styles from "./historial.module.css"
import LocationMap from "./LocationMap.jsx"

export default function Historial() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    // Simulating data fetch
    const sampleData = [
      {
        id: 1001,
        status_name: "Completado",
        services: JSON.stringify([
          {
            title: "Manicura Gel",
            price: 35.0,
            duration: "45 min",
            quantity: 1,
          },
          {
            title: "Pedicura Spa",
            price: 45.0,
            duration: "60 min",
            quantity: 1,
          },
        ]),
        scheduled_date: JSON.stringify({
          start: "2023-05-15 14:00",
          duration: "1 hora 45 minutos",
        }),
        payment_method_name: "Tarjeta de Crédito",
        amount: 80.0,
        point: JSON.stringify({ lat: 19.4326, lng: -99.1332 }),
        address: "Av. Insurgentes Sur 1602, Ciudad de México",
      },
      {
        id: 1002,
        status_name: "Completado",
        services: JSON.stringify([
          {
            title: "Corte de Cabello",
            price: 25.0,
            duration: "30 min",
            quantity: 1,
          },
          {
            title: "Tinte",
            price: 60.0,
            duration: "90 min",
            quantity: 1,
          },
        ]),
        scheduled_date: JSON.stringify({
          start: "2023-05-10 10:00",
          duration: "2 horas",
        }),
        payment_method_name: "Efectivo",
        amount: 85.0,
        point: JSON.stringify({ lat: 19.42, lng: -99.165 }),
        address: "Calle Madero 1, Centro Histórico, Ciudad de México",
      },
      {
        id: 1003,
        status_name: "Completado",
        services: JSON.stringify([
          {
            title: "Masaje Relajante",
            price: 70.0,
            duration: "60 min",
            quantity: 1,
          },
        ]),
        scheduled_date: JSON.stringify({
          start: "2023-05-05 16:30",
          duration: "1 hora",
        }),
        payment_method_name: "PayPal",
        amount: 70.0,
        point: JSON.stringify({ lat: 19.44, lng: -99.2 }),
        address: "Av. Paseo de la Reforma 222, Juárez, Ciudad de México",
      },
    ]

    setHistory(sampleData)
  }, [])

  if (!history || history.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.title}>Historial de Servicios</h2>
        <p>No hay servicios realizados en tu historial</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Servicios</h2>
      <div className={styles.historyList}>
        {history.map((item) => {
          const services = JSON.parse(item.services)
          const scheduledDate = JSON.parse(item.scheduled_date)

          return (
            <article key={item.id} className={styles.historyCard}>
              <header className={styles.cardHeader}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.statusBadge}`}>{item.status_name}</span>
                  <span className={`${styles.badge} ${styles.paidBadge}`}>Pagado</span>
                </div>
                <span className={styles.orderId}>ID: {item.id}</span>
              </header>

              <div className={styles.cardContent}>
                <div className={styles.servicesGrid}>
                  <div className={styles.servicesList}>
                    <h3>Servicios realizados</h3>
                    {services.map((service, index) => (
                      <div key={index} className={styles.serviceItem}>
                        <h4>{service.title}</h4>
                        <dl>
                          <div className={styles.dataRow}>
                            <dt>Precio:</dt>
                            <dd>${service.price.toFixed(2)}</dd>
                          </div>
                          <div className={styles.dataRow}>
                            <dt>Duración:</dt>
                            <dd>{service.duration}</dd>
                          </div>
                          <div className={styles.dataRow}>
                            <dt>Cantidad:</dt>
                            <dd>{service.quantity}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>

                  <div className={styles.appointmentDetails}>
                    <h3>Detalles de la cita</h3>
                    <dl>
                      <div className={styles.dataRow}>
                        <dt>Fecha y hora:</dt>
                        <dd>{scheduledDate.start}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Duración total:</dt>
                        <dd>{scheduledDate.duration}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Método de pago:</dt>
                        <dd>{item.payment_method_name}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Monto total:</dt>
                        <dd>${item.amount.toFixed(2)}</dd>
                      </div>
                    </dl>
                    <div className={styles.address}>
                      <h4>Ubicación del servicio</h4>
                      <p>{item.address}</p>
                      <LocationMap point={JSON.parse(item.point)} address={item.address} />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

