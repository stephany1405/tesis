import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import styles from "./bolsa.module.css";

export const AppointmentCalendar = ({ onDateSelect }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const handleDateSelect = (selectInfo) => {
    const now = new Date();
    if (selectInfo.start < now) {
      alert("No puedes seleccionar fechas pasadas");
      return;
    }

    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
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

    const eventInfo = {
      id: new Date().getTime(),
      title: "Cita Reservada",
      start: selectInfo.start,
      end: selectInfo.end,
      backgroundColor: "#4F46E5",
      borderColor: "#4F46E5",
      display: "block",
    };

    setSelectedEvent(eventInfo);
    setSelectedInfo({
      formattedStart,
      formattedEnd,
    });

    onDateSelect({
      start: selectInfo.start,
      end: selectInfo.end,
      formattedStart,
      formattedEnd,
    });
  };

  return (
    <div className={styles.calendarContainer}>
      {selectedInfo && (
        <div className={styles.selectedAppointment}>
          <div className={styles.appointmentHeader}>
            <h3>Cita Seleccionada</h3>
          </div>
          <div className={styles.appointmentDetails}>
            <p>Fecha y hora: {selectedInfo.formattedStart}</p>
            <p>Hasta: {selectedInfo.formattedEnd}</p>
          </div>
        </div>
      )}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        locale={esLocale}
        select={handleDateSelect}
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
        slotDuration="01:00:00"
        selectConstraint={{
          startTime: "09:00",
          endTime: "20:00",
        }}
        events={selectedEvent ? [selectedEvent] : []}
        unselect={() => {
          setSelectedEvent(null);
          setSelectedInfo(null);
        }}
      />
    </div>
  );
};