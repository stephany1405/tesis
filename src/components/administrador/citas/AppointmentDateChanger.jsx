import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import moment from "moment";
import "moment/locale/es";
import styles from "./appointmentDC.module.css";

const parseDuration = (durationString) => {
  if (!durationString) return 0;

  const parts = durationString.split(" ");
  let hours = 0;
  let minutes = 0;

  for (let i = 0; i < parts.length; i++) {
    const value = Number.parseInt(parts[i]);
    if (isNaN(value)) continue;

    if (parts[i + 1] === "hora" || parts[i + 1] === "horas") {
      hours = value;
      i++;
    } else if (parts[i + 1] === "minuto" || parts[i + 1] === "minutos") {
      minutes = value;
      i++;
    }
  }

  return hours + minutes / 60;
};

const calculateTotalDuration = (services) => {
  if (!Array.isArray(services)) return 0;

  return services.reduce((total, service) => {
    return total + parseDuration(service.duration);
  }, 0);
};

const AppointmentDateChanger = ({ appointment, onDateChange, onClose }) => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [error, setError] = useState("");
  const calendarRef = useRef(null);

  useEffect(() => {
    if (appointment) {
      const startMoment = moment(appointment.start);
      const endMoment = moment(appointment.end);

      setSelectedStartDate(startMoment.toDate());
      setSelectedEndDate(endMoment.toDate());

      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(startMoment.toDate());
      }
    }
  }, [appointment]);

  const handleDateClick = (clickInfo) => {
    const date = clickInfo.date;
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setError("No se pueden seleccionar fines de semana (sábados o domingos)");
      return;
    }

    const startDate = clickInfo.date;
    const totalDurationInHours = calculateTotalDuration(
      appointment.serviceInfo
    );
    const durationInMs = totalDurationInHours * 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationInMs);

    const now = new Date();
    if (startDate < now) {
      setError("No puedes seleccionar fechas pasadas");
      return;
    }

    const maxEndTime = new Date(startDate);
    maxEndTime.setHours(20, 0, 0);

    if (endDate > maxEndTime) {
      setError("La cita no puede exceder las 8:00 PM");
      return;
    }

    setError("");
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  const handleSubmit = () => {
    if (!selectedStartDate || !selectedEndDate) {
      setError("Por favor selecciona fecha y hora");
      return;
    }

    const formattedStart = moment(selectedStartDate)
      .locale("es")
      .format("dddd, D [de] MMMM [de] YYYY, hh:mm a")
      .replace(/am/gi, "a. m.")
      .replace(/pm/gi, "p. m.");

    const formattedEnd = moment(selectedEndDate)
      .locale("es")
      .format("hh:mm a")
      .replace(/am/gi, "a. m.")
      .replace(/pm/gi, "p. m.");

    onDateChange({
      start: formattedStart,
      end: formattedEnd,
      appointmentId: appointment.id,
    });
  };

  const getTotalDurationText = (services) => {
    if (!Array.isArray(services)) return "";

    const totalHours = calculateTotalDuration(services);
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    let result = [];
    if (hours > 0) result.push(`${hours} ${hours === 1 ? "hora" : "horas"}`);
    if (minutes > 0)
      result.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);

    return result.join(" y ");
  };

  const eventContent = (eventInfo) => {
    return (
      <div className={styles.eventContent}>
        <div className={styles.eventTime}>{eventInfo.timeText}</div>
        <div className={styles.eventTitle}>{appointment.client}</div>
        <div className={styles.eventDuration}>
          <Clock size={12} className={styles.clockIcon} />
          {getTotalDurationText(appointment.serviceInfo)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dateChangerContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>Cambiar Fecha y Hora</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.calendarWrapper}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={esLocale}
            dateClick={handleDateClick}
            slotMinTime="09:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            weekends={false}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "09:00",
              endTime: "20:00",
            }}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Hoy",
              week: "Semana",
              day: "Día",
            }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              meridiem: "short",
            }}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              meridiem: "short",
            }}
            events={[
              selectedStartDate && {
                title: appointment.client,
                start: selectedStartDate,
                end: selectedEndDate,
                backgroundColor: appointment.color,
                borderColor: appointment.color,
              },
            ].filter(Boolean)}
            eventContent={eventContent}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonContainer}>
          <button
            onClick={handleSubmit}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            Confirmar Cambio
          </button>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDateChanger;
