import React, { useState, useEffect } from "react";
import { User, Clock, Sparkles } from "lucide-react";
import styles from "./home.module.css";
import axios from "axios";

const Home = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState({
    newClientsResult: 0,
    services: 0,
    pendingQuotes: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/estadistica/dashboard"
        );
        setData({
          newClientsResult: response.data.newClientsResult,
          services: response.data.services,
          pendingQuotes: response.data.pendingQuotes,
        });
      } catch (error) {
        console.error("error dashboard data:", error);
      }
    };

    fetchDashboard();
  }, []);

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
              <p className={styles.statNumber}>{data.newClientsResult}</p>
            </div>
            <div className={styles.statCard}>
              <Clock size={24} />
              <h3>Citas Pendientes</h3>
              <p className={styles.statNumber}>{data.pendingQuotes}</p>
            </div>
            <div className={styles.statCard}>
              <Sparkles size={24} />
              <h3>Servicios Realizados</h3>
              <p className={styles.statNumber}>{data.services}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
