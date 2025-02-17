import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Star,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import styles from "./historial.module.css";

const API_URL = "http://localhost:3000";

const StarRating = ({ rating }) => {
  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={16}
          fill={index < rating ? "#FFD700" : "none"}
          stroke={index < rating ? "#FFD700" : "#ccc"}
        />
      ))}
    </div>
  );
};

const ServiceItem = ({ service, setSelectedService }) => {
  // Verificar si service y sus propiedades existen
  if (!service) {
    return <div>Error: Servicio no válido</div>;
  }

  const services = service.services || [];
  const scheduledDate = service.scheduled_date || {};

  const parseCustomDate = (dateStr) => {
    try {
      if (!dateStr || typeof dateStr !== "string") {
        console.error("Expected string but got:", typeof dateStr, dateStr);
        return null;
      }

      dateStr = dateStr.replace(/^"+|"+$/g, "");

      if (dateStr.includes(",")) {
        const parts = dateStr.split(", ");
        const dayPart = parts[parts.length - 2];
        const timePart = parts[parts.length - 1];

        const [day, monthStr, year] = dayPart
          .split(" de ")
          .map((s) => s.trim());

        const months = {
          enero: 0,
          febrero: 1,
          marzo: 2,
          abril: 3,
          mayo: 4,
          junio: 5,
          julio: 6,
          agosto: 7,
          septiembre: 8,
          octubre: 9,
          noviembre: 10,
          diciembre: 11,
        };

        let time = timePart.replace(" a. m.", "").replace(" p. m.", "").trim();

        const [hours, minutes] = time
          .split(":")
          .map((num) => parseInt(num, 10));

        const date = new Date(
          parseInt(year),
          months[monthStr.toLowerCase()],
          parseInt(day),
          hours,
          minutes
        );

        return date;
      } else {
        const timeStr = dateStr
          .replace(" a. m.", "")
          .replace(" p. m.", "")
          .trim();
        const [hours, minutes] = timeStr
          .split(":")
          .map((num) => parseInt(num, 10));
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      }
    } catch (error) {
      console.error("Error parsing date:", error, "Input:", dateStr);
      return null;
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Fecha no disponible";
      const date = parseCustomDate(dateString);
      if (!date) return "Fecha no disponible";
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error("Error formateando la fecha:", error);
      return "Fecha no disponible";
    }
  };

  const formatTime = (dateString) => {
    try {
      if (!dateString) return "Hora no disponible";
      const date = parseCustomDate(dateString);
      if (!date) return "Hora no disponible";
      return format(date, "HH:mm");
    } catch (error) {
      console.error("Error formateando hora:", error);
      return "Hora no disponible";
    }
  };

  return (
    <div
      className={styles.historyItem}
      onClick={() => setSelectedService(service)}
    >
      <div className={styles.serviceName}>
        {services.length > 0 && services[0]?.title
          ? services[0].title
          : "Servicio sin nombre"}
      </div>
      <div className={styles.serviceInfo}>
        <div className={styles.infoItem}>
          <Calendar size={16} />
          <span>
            {scheduledDate.start
              ? formatDate(scheduledDate.start)
              : "Fecha no disponible"}
          </span>
        </div>
        <div className={styles.infoItem}>
          <Clock size={16} />
          <span>
            {scheduledDate.start
              ? formatTime(scheduledDate.start)
              : "Hora no disponible"}
            {scheduledDate.end ? ` - ${scheduledDate.end}` : ""}
          </span>
        </div>
        <div className={styles.infoItem}>
          <CreditCard size={16} />
          <span>
            Método de pago: {service.payment_method || "No especificado"}
          </span>
        </div>
        <div className={styles.infoItem}>
          <MapPin size={16} />
          <span>Dirección: {service.address || "No especificada"}</span>
        </div>
        <div className={styles.infoItem}>
          <DollarSign size={16} />
          <span>
            Costo: {(service.amount || "0").toString().replace("$", "")}
          </span>
        </div>
        <div className={styles.infoItem}>
          <CreditCard size={16} />
          <span>
            Referencia de Pago: {service.reference_payment || "No especificada"}
          </span>
        </div>
      </div>

      <div className={styles.specialists}>
        <div className={styles.specialistsHeader}>
          <Users size={16} />
          <strong>Especialistas:</strong>
        </div>
        <div className={styles.specialistList}>
          {service.specialists && service.specialists.length > 0 ? (
            service.specialists.map((specialist, idx) => (
              <div key={idx} className={styles.specialistItem}>
                <img
                  src={
                    specialist.picture_profile
                      ? `${API_URL}${specialist.picture_profile}`
                      : "/placeholder.svg"
                  }
                  alt={`${specialist.name} ${specialist.lastname}`}
                  className={styles.specialistImage}
                />
                <div className={styles.specialistInfo}>
                  <div className={styles.specialistName}>
                    {specialist.name} {specialist.lastname}
                  </div>
                  <StarRating rating={specialist.rating || 0} />
                </div>
              </div>
            ))
          ) : (
            <div>No hay especialistas asignados</div>
          )}
        </div>
      </div>
    </div>
  );
};

function Historial({ setSelectedService }) {
  const [servicioNoActivo, setServicioNoActivo] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoActiveService = async () => {
      try {
        const token = getJWT("token");
        const decoded = jwtDecode(token);
        const id = Number.parseInt(decoded.id);
        const response = await fetch(
          `${API_URL}/api/servicios/agenda/noactivo?userID=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setServicioNoActivo(Array.isArray(data) ? data : data ? [data] : []);
        } else {
          setServicioNoActivo([]);
          console.log("No inactive services found:", data.message);
        }
      } catch (error) {
        setError("Error al cargar el historial de servicios");
        console.error("Error detalles:", error);
        setServicioNoActivo([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNoActiveService();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!servicioNoActivo || servicioNoActivo.length === 0) {
    return (
      <div className={styles.noHistory}>No hay historial de servicios</div>
    );
  }

  return (
    <div className={styles.historyList}>
      {servicioNoActivo.map((service, index) => (
        <ServiceItem
          key={index}
          service={service}
          setSelectedService={setSelectedService}
        />
      ))}
    </div>
  );
}

export default Historial;
