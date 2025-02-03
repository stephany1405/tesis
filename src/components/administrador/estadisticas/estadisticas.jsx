import React, { useEffect, useState } from "react";
import EstadisticasVentas from "./EstadisticasVentas";
import EstadisticasClientes from "./EstadisticasClientes";
import EstadisticasCitas from "./EstadisticasCitas";
import EstadisticasEmpleados from "./EstadisticasEmpleados";
import styles from "./estadisticas.module.css";
import { BarChart2 } from "lucide-react";

const DashboardEstadisticas = () => {
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
      className={`${styles.pageWrapper} ${
        isSidebarCollapsed ? styles.pageWrapperCollapsed : ""
      }`}
    >
      <div className={styles.dashboard}>
        <h1 className={styles.title}>
          <BarChart2 size={35} /> Estadísticas
        </h1>
        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <EstadisticasVentas />
          </div>
          <EstadisticasClientes />
          <EstadisticasCitas />
          <div className={styles.fullWidth}>
            <EstadisticasEmpleados />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEstadisticas;
