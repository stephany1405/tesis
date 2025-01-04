import React from "react";
import styles from "./header.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/usuario/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>uñimas</a>
      <nav className={styles.nav}>
        <a href="/catalogo" className={styles.navItem}>Catálogo</a>
        <a href="/agenda" className={styles.navItem}>Agenda</a>
        <a href="/perfil" className={styles.navItem}>Carrito</a>
        <a href="/perfil" className={styles.navItem}>Perfil</a>
        <button className={styles.navItem} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default Header;
