import { useNavigate } from "react-router-dom"
import { LogOut, Bell, User, Activity, Clock } from "lucide-react"
import styles from "./header.module.css"
import axios from "axios"
import Cookies from "js-cookie"

export default function Header({ setActiveTab, activeTab }) {
  const navigate = useNavigate()
  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/usuario/logout")

      if (response.status === 200) {
        localStorage.clear()
        Cookies.remove("token", { path: "/" })
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

        console.log("Sesión cerrada correctamente.")
        navigate("/")
      } else {
        console.error("Error al cerrar sesión:", response.data)
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
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
            onClick={() => setActiveTab("history")}
            className={`${styles.navButton} ${activeTab === "history" ? styles.active : ""}`}
          >
            <Clock size={18} />
            <span>Historial</span>
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

