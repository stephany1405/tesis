import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DesplegableC } from "./desplegableC";
import styles from "./Header.module.css";

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          uñimas
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/" className={location.pathname === "/" ? styles.active : ""}>
          Inicio
        </Link>
        <Link to="/servicios" className={location.pathname === "/servicios" ? styles.active : ""}>
          Servicios
        </Link>
        <Link to="/perfil" className={location.pathname === "/contacto" ? styles.active : ""}>
          Perfil
        </Link>
      </nav>
      <div className={styles.cartContainer}>
        <DesplegableC />
      </div>
    </header>
  );
};

export default Header;