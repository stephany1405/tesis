import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DesplegableC } from "./desplegableC";
import axios from "axios";
import styles from "./Header.module.css";

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/usuario/logout"
      );

      if (response.status === 200) {
        console.log("Sesión cerrada correctamente.");
        navigate("/login");
      } else {
        console.error("Error al cerrar sesión:", response.data);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/inicio" className={styles.logo}>
          uñimas
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/inicio" className={location.pathname === "/" ? styles.active : ""}>
          Inicio
        </Link>
        <Link
          to="/servicios"
          className={location.pathname === "/servicios" ? styles.active : ""}
        >
          Servicios
        </Link>
        <Link
          to="/perfil"
          className={location.pathname === "/perfil" ? styles.active : ""}
        >
          Perfil
        </Link>
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </nav>
      <div className={styles.cartContainer}>
        <DesplegableC />
      </div>
    </header>
  );
};

export default Header;
