import React, { useState, useEffect } from "react"
import styles from "./Agenda.module.css"
import Status from "./Status"
import InfoAgenda from "./infoAgenda"
import Historial from "./Historial"
import { getJWT } from "../middlewares/getToken.jsx"
import { jwtDecode } from "jwt-decode"
import axios from "axios"

function Agenda() {
  const [activeTab, setActiveTab] = useState("status")
  const [selectedHistorialService, setSelectedHistorialService] = useState(null)
  const [servicioActivo, setServicioActivo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = "http://localhost:3000"

  useEffect(() => {
    const fetchActiveService = async () => {
      try {
        const token = getJWT("token")
        const decodedToken = jwtDecode(token)
        const id = Number.parseInt(decodedToken.id)
        const response = await axios.get(`${API_URL}/api/servicios/agenda/activo?userID=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = response.data

        if (data.status_order) {
          setServicioActivo({
            servicios: data.services,
            fecha: data.scheduled_date.start,
            hora: data.scheduled_date.start.split(", ")[2],
            duracionTotal: data.scheduled_date.duration,
            ubicacion: data.address,
            formaPago: data.payment_method,
            monto: data.amount,
            estado: data.status_id,
            referenciaPago: data.reference_payment,
            especialista: {
              nombre: data.specialist_name,
              foto: data.specialist_photo
                ? `${API_URL}${data.specialist_photo}`
                : "/placeholder.svg?height=50&width=50",
              calificacion: data.specialist_rating,
            },
          })
        } else {
          setServicioActivo(null)
        }
      } catch (err) {
        setError("Error al cargar el servicio activo")
        console.error("Error detalles:", err)
        if (err.response && err.response.status === 404) {
          setServicioActivo(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchActiveService()
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "status":
        return <Status data={servicioActivo} />
      case "agenda":
        return <InfoAgenda data={servicioActivo} />
      case "historial":
        return <Historial setSelectedService={setSelectedHistorialService} />
      default:
        return null
    }
  }

  if (loading) return <div className={styles.loadingContainer}>Cargando...</div>
  if (error) return <div className={styles.errorContainer}>{error}</div>
  if (!servicioActivo) return <div className={styles.noActiveServicesContainer}>No hay servicios activos</div>

  return (
    <div className={styles.container}>
      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${activeTab === "status" ? styles.active : ""}`}
          onClick={() => setActiveTab("status")}
        >
          Estatus
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "agenda" ? styles.active : ""}`}
          onClick={() => setActiveTab("agenda")}
        >
          Información de agenda
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "historial" ? styles.active : ""}`}
          onClick={() => setActiveTab("historial")}
        >
          Historial
        </button>
      </div>
      <div className={styles.contentContainer}>{renderContent()}</div>
    </div>
  )
}

export default Agenda

