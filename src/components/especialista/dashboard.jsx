import React, { useState } from "react"
import Header from "./header"
import Notificaciones from "./notificaciones"
import Perfil from "./perfil"
import Status from "./serviceStatus.jsx"
import styles from "./dashboard.module.css"

export default function SpecialistDashboard() {
  const [activeTab, setActiveTab] = useState("notifications")

  const renderContent = () => {
    switch (activeTab) {
      case "notifications":
        return <Notificaciones />
      case "profile":
        return <Perfil />
      case "status":
        return <Status />
      default:
        return <Notificaciones />
    }
  }

  return (
    <div className={styles.dashboard}>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className={styles.content}>{renderContent()}</main>
    </div>
  )
}

