import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DesplegableC } from "./desplegableC";
import axios from "axios";
import styles from "./Header.module.css";
import Cookies from "js-cookie";

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        navigate("/login");
      } else {
        console.error("Error al cerrar sesión:", response.data);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleServices = () => {
    setShowServices(!showServices);
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const services = [
    { name: "Facial", path: "/servicios/facial/1" },
    { name: "Corporales", path: "/servicios/corporales/2" },
    { name: "Manicuras", path: "/servicios/manicuras/3" },
    { name: "Pedicura", path: "/servicios/pedicura/4" },
    { name: "Quiropodia", path: "/servicios/quiropodia/5" },
    { name: "Epilación", path: "/servicios/epilacion/6" },
    { name: "Extensiones", path: "/servicios/extension/7" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/inicio" className={styles.logo}>
          uñimass
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link
          to="/inicio"
          className={location.pathname === "/" ? styles.active : ""}
        >
          Inicio
        </Link>
        <Link
          to="/agenda"
          className={location.pathname === "/" ? styles.active : ""}
        >
          Agenda
        </Link>
        <div className={styles.dropdownContainer}>
          <span onClick={toggleServices} className={styles.dropdownButton}>
            Servicios
          </span>
          {showServices && (
            <div className={styles.dropdownContent}>
              {services.map((service, index) => (
                <Link key={index} to={service.path}>
                  {service.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <DesplegableC />
        <Link
          to="/perfil"
          className={location.pathname === "/perfil" ? styles.active : ""}
        >
          Perfil
        </Link>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default Header;
