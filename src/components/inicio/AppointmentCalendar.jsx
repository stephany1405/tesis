import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import styles from "./bolsa.module.css";

export const AppointmentCalendar = ({ onDateSelect, totalDuration = 0 }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const BUSINESS_HOURS = {
    start: 9,
    end: 20,
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);

    let formattedDuration = "";

    if (hours > 0) {
      formattedDuration += `${hours} hora${hours > 1 ? "s" : ""}`;
    }

    if (minutes > 0) {
      if (formattedDuration) {
        formattedDuration += " ";
      }
      formattedDuration += `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    }

    if (!formattedDuration) {
      formattedDuration = "0 minutos";
    }

    return formattedDuration;
  };

  const handleDateClick = (clickInfo) => { 
    const now = new Date();
    if (clickInfo.date < now) {
      alert("No puedes seleccionar fechas pasadas");
      return;
    }

    const startDate = new Date(clickInfo.date);
    const durationInMs = totalDuration * 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationInMs);

    const maxEndTime = new Date(startDate);
    maxEndTime.setHours(BUSINESS_HOURS.end, 0, 0);

    if (endDate > maxEndTime) {
      const horasDisponibles = BUSINESS_HOURS.end - startDate.getHours();
      alert(`No es posible agendar esta cita aquí.
            La duración total es de ${formatDuration(totalDuration)},
            pero solo quedan ${horasDisponibles} horas disponibles en este día.
            Por favor selecciona un horario más temprano.`);
      return;
    }

    const eventInfo = {
      id: new Date().getTime(),
      title: `Cita Reservada (${formatDuration(totalDuration)})`,
      start: startDate,
      end: endDate,
      backgroundColor: "#FF69B4",
      borderColor: "#FF69B4",
      display: "block",
    };

    setSelectedEvent(eventInfo);

    const formattedStart = startDate.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedEnd = endDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedInfo({
      formattedStart,
      formattedEnd,
    });

    onDateSelect({
      start: startDate,
      end: endDate,
      formattedStart,
      formattedEnd,
    });
  };

  const handleUnselect = () => {
    setSelectedEvent(null);
    setSelectedInfo(null);
    onDateSelect(null);
  };

  return (
    <div className={styles.calendarContainer}>
      {selectedInfo && (
        <div className={styles.selectedAppointment}>
          <div className={styles.appointmentHeader}>
            <h3>Cita Seleccionada</h3>
          </div>
          <div className={styles.appointmentDetails}>
            <p>Inicio: {selectedInfo.formattedStart}</p>
            <p>Fin: {selectedInfo.formattedEnd}</p>
            <p>Duración total: {formatDuration(totalDuration)}</p>
          </div>
        </div>
      )}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        dayMaxEvents={true}
        weekends={true}
        locale={esLocale}
        dateClick={handleDateClick} // ¡USAR dateClick!
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoy",
          week: "Semana",
          day: "Día",
        }}
        slotMinTime="09:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        selectConstraint={{
          startTime: "09:00",
          endTime: "20:00",
        }}
        events={selectedEvent ? [selectedEvent] : []}
        unselect={handleUnselect}
      />
    </div>
  );
};

export default AppointmentCalendar;