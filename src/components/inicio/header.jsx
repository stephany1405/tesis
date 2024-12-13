import React from "react";
import styles from "./header.module.css";
const header = () => {
    return (
      <>
        <header className={styles.header}>
          <a href="/" className={styles.logo}>uñimas</a>
          <nav className={styles.nav}>
            <a href="/catalogo" className={styles.navItem}>Catálogo</a>
            <a href="/agenda" className={styles.navItem}>Agenda</a>
            <a href="/perfil" className={styles.navItem}>Carrito</a>
            <a href="/perfil" className={styles.navItem}>Perfil</a>
          </nav>
        </header>
        </>
  );
};

export default header;
