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
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const params = {};
        if (dateRange.start && dateRange.end) {
          params.start = dateRange.start;
          params.end = dateRange.end;
        }
        const response = await axios.get(
          "http://localhost:3000/api/estadistica/dashboard",
          { params }
        );
        setData({
          newClientsResult: response.data.newClientsResult,
          services: response.data.services,
          pendingQuotes: response.data.pendingQuotes,
        });
      } catch (error) {
        console.error("Error al obtener la data del dashboard:", error);
      }
    };

    fetchDashboard();
  }, [dateRange]);

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

  const clientsTitle =
    dateRange.start && dateRange.end
      ? `Clientes Registrados (${dateRange.start} – ${dateRange.end})`
      : "Clientes Hoy";
  const pendingTitle =
    dateRange.start && dateRange.end
      ? `Citas Pendientes (${dateRange.start} – ${dateRange.end})`
      : "Citas Pendientes";
  const servicesTitle =
    dateRange.start && dateRange.end
      ? `Servicios Realizados (${dateRange.start} – ${dateRange.end})`
      : "Servicios Realizados";

  const resetDates = () => {
    setDateRange({ start: "", end: "" });
  };

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
              Aquí tienes un resumen de la actividad de tu centro de estética.
              {dateRange.start && dateRange.end && (
                <span>
                  {" "}
                  Mostrando datos desde <strong>
                    {dateRange.start}
                  </strong> hasta <strong>{dateRange.end}</strong>.
                </span>
              )}
            </p>
          </div>
          <div className={styles.dateFilters}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <span> a </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
            <button className={styles.homeServiceButton} onClick={resetDates}>
              Resetear
            </button>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <User size={24} />
              <h3>{clientsTitle}</h3>
              <p className={styles.statNumber}>{data.newClientsResult}</p>
            </div>
            <div className={styles.statCard}>
              <Clock size={24} />
              <h3>{pendingTitle}</h3>
              <p className={styles.statNumber}>{data.pendingQuotes}</p>
            </div>
            <div className={styles.statCard}>
              <Sparkles size={24} />
              <h3>{servicesTitle}</h3>
              <p className={styles.statNumber}>{data.services}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
