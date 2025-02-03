import { useState } from "react"
import Header from "./header"
import Notificaciones from "./notificaciones"
import Perfil from "./perfil"
import Status from "./serviceStatus"
import Historial from "./historial"
import styles from "./dashboard.module.css"

export default function SpecialistDashboard() {
  const [activeTab, setActiveTab] = useState("calendar")
  const [specialistId, setSpecialistId] = useState("1") // Replace with actual specialist ID

  const renderContent = () => {
    switch (activeTab) {
      case "notifications":
        return <Notificaciones />
      case "profile":
        return <Perfil />
      case "status":
        return <Status />
      case "history":
        return <Historial />
      default:
        return null
    }
  }

  return (
    <div className={styles.dashboard}>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className={styles.content}>{renderContent()}</main>
    </div>
  )
}

