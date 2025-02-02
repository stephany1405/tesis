import { useState } from "react"
import Header from "./header"
import Notificaciones from "./notificaciones"
import Perfil from "./perfil"
import Status from "./serviceStatus"
import Calendario from "./calendario"
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
      case "calendar":
        return <Calendario specialistId={specialistId} />
      default:
        return <Calendario specialistId={specialistId} />
    }
  }

  return (
    <div className={styles.dashboard}>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className={styles.content}>{renderContent()}</main>
    </div>
  )
}

