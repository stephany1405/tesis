import React, { useEffect, useState } from "react";
import styles from "./notificaciones.module.css";
import axios from "axios";
import ServiceSelection from "./ServiceSelection.jsx";
import LocationMap from "./LocationMap.jsx";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";

export default function Notificaciones() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/servicios/clientes"
      );
      const { data } = response;
      console.log(data);
      if (!data || data.length === 0) {
        setNotifications([]);
        return;
      }

      const today = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const pedidosHoy = data.filter((notif) => {
        const scheduledDate = JSON.parse(notif.scheduled_date);
        const fechaPedido = scheduledDate.start.split(",")[1]?.trim();

        if (!fechaPedido) return false;

        const fechaPedidoCorta = fechaPedido
          .split("de")
          .slice(0, 3)
          .join("de")
          .trim();

        return fechaPedidoCorta === today;
      });

      setNotifications(pedidosHoy);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const handleAceptarServicio = async (id, serviceData) => {
    try {
      const token = getJWT("token");
      const decodedToken = jwtDecode(token);
      const specialistId = decodedToken.id;

      const response = await axios.post(
        "http://localhost:3000/api/servicios/asignar-servicio",
        {
          appointmentId: id,
          specialistId: specialistId,
          serviceId: serviceData.serviceId,
          sessions: serviceData.sessions,
        }
      );

      alert("Servicio asignado correctamente");
      await cargarNotificaciones();
    } catch (error) {
      console.error(
        "Error al aceptar servicio:",
        error.response?.data?.error || error.message
      );
      alert(
        error.response?.data?.error ||
          "Ocurrió un error al asignar el servicio."
      );
    }
  };

  const handleCancelarServicio = (id) => {
    console.log(`Servicio ${id} cancelado`);
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.title}>Notificaciones de Servicios</h2>
        <p>No hay servicios programados para hoy</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Notificaciones de Servicios</h2>
      <div className={styles.notificationsList}>
        {notifications.map((notification) => {
          const services = JSON.parse(notification.services);
          const scheduledDate = JSON.parse(notification.scheduled_date);

          return (
            <article key={notification.id} className={styles.notificationCard}>
              <header className={styles.cardHeader}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.statusBadge}`}>
                    {notification.status_name || "Estado Pendiente"}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      notification.paid ? styles.paidBadge : styles.unpaidBadge
                    }`}
                  >
                    {notification.paid ? "Pagado" : "No pagado"}
                  </span>
                </div>
                <span className={styles.orderId}>ID: {notification.id}</span>
              </header>

              <div className={styles.cardContent}>
                <div className={styles.servicesGrid}>
                  <div className={styles.servicesList}>
                    <h3>Servicios solicitados</h3>
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
                          {service.note !== "Sin nota" && (
                            <div className={styles.dataRow}>
                              <dt>Nota:</dt>
                              <dd>{service.note}</dd>
                            </div>
                          )}
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
                        <dd>{notification.payment_method_name}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Monto total:</dt>
                        <dd>{notification.amount}</dd>
                      </div>
                      <div className={styles.dataRow}>
                        <dt>Referencia:</dt>
                        <dd>{notification.reference_payment}</dd>
                      </div>
                    </dl>
                    <div className={styles.address}>
                      <LocationMap
                        point={JSON.parse(notification.point)}
                        address={notification.address}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.serviceSelectionContainer}>
                <ServiceSelection
                  services={services}
                  onAccept={async (serviceData) => {
                    await handleAceptarServicio(notification.id, serviceData);
                  }}
                />
              </div>

              <footer className={styles.cardFooter}>
                <button
                  onClick={() => handleCancelarServicio(notification.id)}
                  className={`${styles.button} ${styles.cancelButton}`}
                >
                  Cancelar
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
