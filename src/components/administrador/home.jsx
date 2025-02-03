import React, { useState, useEffect } from "react";
import { User, Clock, Sparkles } from "lucide-react";
import styles from "./home.module.css";

const Home = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarChange = () => {
      setIsSidebarCollapsed(
        document.body.classList.contains("sidebar-collapsed")
      );
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`${styles.homeBody} ${
        isSidebarCollapsed ? styles.homeBodyCollapsed : ""
      }`}
    >
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Panel de Administración</h1>
          <div className={styles.userInfo}>
            <img
              src="https://i.pravatar.cc/40"
              alt="Admin"
              className={styles.avatar}
            />
            <span>Admin</span>
          </div>
        </header>
        <div className={styles.dashboardContent}>
          <div className={styles.welcomeCard}>
            <h2>Bienvenido de vuelta, Admin</h2>
            <p>
              Aquí tienes un resumen de la actividad reciente de tu centro de
              estética.
            </p>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <User size={24} />
              <h3>Clientes Hoy</h3>
              <p className={styles.statNumber}>24</p>
            </div>
            <div className={styles.statCard}>
              <Clock size={24} />
              <h3>Citas Pendientes</h3>
              <p className={styles.statNumber}>8</p>
            </div>
            <div className={styles.statCard}>
              <Sparkles size={24} />
              <h3>Servicios Realizados</h3>
              <p className={styles.statNumber}>56</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
