import React, { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { generateMockAppointments } from "./data"
import styles from "./calendario.module.css"

const AdminAppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    setAppointments(generateMockAppointments(14)) // Generate 2 weeks of appointments
  }, [])

  const handleEventClick = (clickInfo) => {
    setSelectedAppointment(clickInfo.event.extendedProps)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className={`${styles.statusBadge} ${styles.confirmed}`}>Confirmada</span>
      case "pending":
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Pendiente</span>
      case "cancelled":
        return <span className={`${styles.statusBadge} ${styles.cancelled}`}>Cancelada</span>
      default:
        return null
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.calendarContainer}>
        <h2 className={styles.calendarTitle}>Calendario de Citas</h2>
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
          eventContent={(eventInfo) => (
            <div style={{ fontSize: "0.75rem" }}>
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
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {new Date(selectedAppointment.start).toLocaleString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className={styles.detailItem}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{selectedAppointment.service}</span>
            </div>
            <div className={styles.detailItem}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>{selectedAppointment.client}</span>
            </div>
            <div className={styles.detailItem}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>{selectedAppointment.specialist}</span>
            </div>
            <div>{getStatusBadge(selectedAppointment.status)}</div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAppointmentCalendar

