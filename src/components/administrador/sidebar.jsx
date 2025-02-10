import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  UserCog,
  Sparkles,
  Calendar,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  DatabaseBackup,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }

    return () => {
      document.body.classList.remove("sidebar-collapsed");
    };
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/usuario/logout"
      );

      if (response.status === 200) {
        localStorage.clear();
        Cookies.remove("token", { path: "/" });
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        console.log("Sesión cerrada correctamente.");
        navigate("/");
      } else {
        console.error("Error al cerrar sesión:", response.data);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    console.log("Cerrando sesión...");
  };

  const menuItems = [
    { icon: <Home size={20} />, label: "Inicio", path: "/administrador" },
    {
      icon: <Users size={20} />,
      label: "Clientes",
      path: "/administrador/clientes",
    },
    {
      icon: <UserCog size={20} />,
      label: "Especialistas",
      path: "/administrador/especialistas",
    },
    {
      icon: <Sparkles size={20} />,
      label: "Servicios",
      path: "/administrador/servicios",
    },
    {
      icon: <Calendar size={20} />,
      label: "Citas",
      path: "/administrador/citas",
    },
    {
      icon: <BarChart2 size={20} />,
      label: "Estadísticas",
      path: "/administrador/estadisticas",
    },
    {
      icon: <DatabaseBackup size={20} />,
      label: "Backup",
      path: "/administrador/backup",
    },
  ];

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarHeader}>
        {!isCollapsed && <h2 className={styles.sidebarTitle}>Uñimas</h2>}
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
                className={`${styles.sidebarMenuLink} ${
                  location.pathname === item.path ? styles.active : ""
                }`}
                title={item.label}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarFooter}>
        <Link className={styles.sidebarFooterLink} onClick={handleLogout}>
          <LogOut size={20} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
