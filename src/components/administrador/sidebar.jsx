import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Users,
  UserCog,
  Scissors,
  Calendar,
  DollarSign,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Home,
  Bell,
  Settings,
  LogOut,
} from "lucide-react"
import styles from "./Sidebar.module.css"

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    { icon: <Home size={20} />, label: "Inicio", path: "/administrador" },
    { icon: <Users size={20} />, label: "Clientes", path: "/administrador/clientes" },
    { icon: <UserCog size={20} />, label: "Especialistas", path: "/administrador/especialistas" },
    { icon: <Scissors size={20} />, label: "Servicios", path: "/administrador/servicios" },
    { icon: <Calendar size={20} />, label: "Citas", path: "/administrador/citas" },
    { icon: <DollarSign size={20} />, label: "Financias", path: "/administrador/finanzas" },
    { icon: <BarChart2 size={20} />, label: "Estadísticas", path: "/administrador/estadisticas" },
  ]

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>{isCollapsed ? "US" : "Uñimas"}</h2>
        <button className={styles.toggleButton} onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className={styles.sidebarNav}>
        <ul className={styles.sidebarMenu}>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.sidebarMenuItem}>
              <Link
                to={item.path}
                className={`${styles.sidebarMenuLink} ${location.pathname === item.path ? styles.active : ""}`}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarFooter}>
        <Link to="/administrador/notificaciones" className={styles.sidebarFooterLink}>
          <Bell size={20} />
          {!isCollapsed && <span>Notificaciones</span>}
        </Link>
        <Link to="/administrador/configuracion" className={styles.sidebarFooterLink}>
          <Settings size={20} />
          {!isCollapsed && <span>Configuración</span>}
        </Link>
        <Link to="/logout" className={styles.sidebarFooterLink}>
          <LogOut size={20} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Link>
      </div>
    </div>
  )
}

export default Sidebar

