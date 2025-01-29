import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import axios from "axios";
import moment from "moment";
import "moment/locale/es";
import "moment-timezone";
import styles from "./calendario.module.css";

moment.locale("es");

const AdminAppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/servicios/agenda/presencial"
        );
        const appointmentsWithLocalTime = response.data.map((appointment) => {
          const start = moment.utc(appointment.start).local().format();
          const end = moment.utc(appointment.end).local().format();
          return {
            ...appointment,
            start,
            end,
          };
        });
        setAppointments(appointmentsWithLocalTime);
      } catch (error) {
        console.error("Error al obtener las citas:", error);
      }
    };

    const fetchSpecialists = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/especialistas"
        );
        setSpecialists(response.data);
      } catch (error) {
        console.error("Error al obtener los especialistas:", error);
      }
    };

    fetchAppointments();
    fetchSpecialists();
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedAppointment({
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      ...clickInfo.event.extendedProps,
    });
    setSelectedSpecialist("");
  };

  const handleAddSpecialist = async () => {
    if (!selectedSpecialist || !selectedAppointment) return;

    try {
      await axios.post(
        `http://localhost:3000/api/servicios/agenda/${selectedAppointment.id}/especialista`,
        {
          specialistId: selectedSpecialist,
        }
      );

      // Actualizar la cita seleccionada con el nuevo especialista
      const updatedAppointment = {
        ...selectedAppointment,
        specialist: specialists.find((s) => s.id === selectedSpecialist).name,
      };
      setSelectedAppointment(updatedAppointment);

      // Actualizar la lista de citas
      setAppointments(
        appointments.map((app) =>
          app.id === selectedAppointment.id ? updatedAppointment : app
        )
      );

      setSelectedSpecialist("");
    } catch (error) {
      console.error("Error al agregar el especialista:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className={`${styles.statusBadge} ${styles.confirmed}`}>
            Confirmada
          </span>
        );
      case "pending":
        return (
          <span className={`${styles.statusBadge} ${styles.pending}`}>
            Pendiente
          </span>
        );
      case "cancelled":
        return (
          <span className={`${styles.statusBadge} ${styles.cancelled}`}>
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.calendarContainer}>
        <h2 className={styles.calendarTitle}>
          Calendario de Citas Presenciales
        </h2>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          locale={esLocale}
          events={appointments}
          eventClick={handleEventClick}
          slotMinTime="09:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
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
          eventContent={(eventInfo) => (
            <div style={{ fontSize: "0.75rem", padding: "2px" }}>
              <div style={{ fontWeight: "bold" }}>{eventInfo.timeText}</div>
              <div>{eventInfo.event.title}</div>
            </div>
          )}
        />
      </div>

      {selectedAppointment && (
        <div className={styles.detailsContainer}>
          <h2 className={styles.detailsTitle}>Detalles de la Cita</h2>
          <div className={styles.detailsContent}>
            <div className={styles.detailItem}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.icon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {moment(selectedAppointment.start)
                  .locale("es")
                  .format("dddd, D [de] MMMM [de] YYYY, h:mm A")}
              </span>
            </div>
            <div className={styles.detailItem}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.icon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{selectedAppointment.service}</span>
            </div>
            <div className={styles.detailItem}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.icon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{selectedAppointment.client}</span>
            </div>
            <div>{getStatusBadge(selectedAppointment.status)}</div>
            <div className={styles.detailItem}>
              <span>Monto: {selectedAppointment.amount}</span>
            </div>
            <div className={styles.detailItem}>
              <span>
                Estado de pago:{" "}
                {selectedAppointment.paid ? "Pagado" : "Pendiente"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span>
                Especialista: {selectedAppointment.specialist || "No asignado"}
              </span>
            </div>
            <div className={styles.addSpecialistContainer}>
              <select
                value={selectedSpecialist}
                onChange={(e) => setSelectedSpecialist(e.target.value)}
                className={styles.specialistSelect}
              >
                <option value="">Seleccionar especialista</option>
                {specialists.map((specialist) => (
                  <option key={specialist.id} value={specialist.id}>
                    {specialist.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSpecialist}
                className={styles.addSpecialistButton}
              >
                Agregar Especialista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentCalendar;
