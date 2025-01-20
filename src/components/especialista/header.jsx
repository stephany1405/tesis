import React from "react"
import { LogOut, Bell, User, Activity } from "lucide-react"
import styles from "./header.module.css"

export default function Header({ setActiveTab, activeTab }) {
  const handleLogout = () => {
    // Implementar lógica de cierre de sesión aquí
    console.log("Cerrando sesión...")
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>Uñimas Especialista</div>
        <nav className={styles.nav}>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`${styles.navButton} ${activeTab === "notifications" ? styles.active : ""}`}
          >
            <Bell size={18} />
            <span>Notificaciones</span>
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`${styles.navButton} ${activeTab === "status" ? styles.active : ""}`}
          >
            <Activity size={18} />
            <span>Estado</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`${styles.navButton} ${activeTab === "profile" ? styles.active : ""}`}
          >
            <User size={18} />
            <span>Perfil</span>
          </button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  )
}

