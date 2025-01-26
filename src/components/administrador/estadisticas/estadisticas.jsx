import React from "react"
import EstadisticasVentas from "./EstadisticasVentas"
import EstadisticasClientes from "./EstadisticasClientes"
import EstadisticasCitas from "./EstadisticasCitas"
import EstadisticasEmpleados from "./EstadisticasEmpleados"
import styles from "./estadisticas.module.css"

const DashboardEstadisticas = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Estadísticas</h1>
      <div className={styles.grid}>
        <EstadisticasVentas />
        <EstadisticasClientes />
        <EstadisticasCitas />
        <EstadisticasEmpleados />
      </div>
    </div>
  )
}

export default DashboardEstadisticas

