import { useEffect, useState } from "react";
import styles from "./historial.module.css";
import LocationMap from "./LocationMap.jsx";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
export default function Historial() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = getJWT("token");
        const { role_id, id } = jwtDecode(token);

        const { data } = await axios.get(
          `http://localhost:3000/api/servicios/historia-especialista?roleID=${role_id}&specialistID=${id}`
        );

        if (data.length === 0) {
          throw new Error("Error al obtener el historial");
        }

        const transformedData = data.map((item, index) => {
          const fechaCita = JSON.parse(item.fecha_cita);

          return {
            id: item.id_appointment,
            status_name: item.estado_servicio,
            services: JSON.stringify([
              {
                title: item.nombre_servicio,
                price: item.ganancias_servicio,
                duration: fechaCita.duration || "No disponible",
                quantity: 1,
              },
            ]),
            scheduled_date: JSON.stringify({
              start: fechaCita.start,
              duration: fechaCita.duration,
              end: fechaCita.end,
            }),
            payment_method_name: item.metodo_pago,
            amount: item.ganancias_servicio,
            point: item.coordenadas,
            address: item.direccion,
            specialist_name: item.nombre_especialista,
            client_name: item.nombre_cliente,
            client_rating: item.calificacion_cliente,
            specialist_rating: item.calificacion_especialista,
          };
        });

        setHistory(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <h2 className={styles.title}>Historial de Servicios</h2>
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <h2 className={styles.title}>Historial de Servicios</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.title}>Historial de Servicios</h2>
        <p>No hay servicios realizados en tu historial</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Servicios</h2>
      <div className={styles.historyList}>
        {history.map((item) => {
          const services = JSON.parse(item.services);
          const scheduledDate = JSON.parse(item.scheduled_date);

          return (
            <article key={item.id} className={styles.historyCard}>
              <header className={styles.cardHeader}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.statusBadge}`}>
                    {item.status_name}
                  </span>
                  <span className={`${styles.badge} ${styles.paidBadge}`}>
                    Pagado
                  </span>
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
                            <dd>${service.price}</dd>
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
                        <dt>Cliente:</dt>
                        <dd>{item.client_name}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Especialista:</dt>
                        <dd>{item.specialist_name}</dd>
                      </div>
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
                        <dd>${item.amount}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Calificación del cliente:</dt>
                        <dd>{item.client_rating || "Sin calificación"}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Calificación del especialista:</dt>
                        <dd>{item.specialist_rating || "Sin calificación"}</dd>
                      </div>
                    </dl>
                    <div className={styles.address}>
                      <h4>Ubicación del servicio</h4>
                      <p>{item.address}</p>
                      <LocationMap
                        point={JSON.parse(item.point)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
