import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import styles from "./EstadisticasClientes.module.css"

const dataEdad = [
  { name: "18-25", value: 20 },
  { name: "26-35", value: 30 },
  { name: "36-45", value: 25 },
  { name: "46+", value: 25 },
]

const dataGenero = [
  { name: "Femenino", value: 65 },
  { name: "Masculino", value: 35 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const EstadisticasClientes = () => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Clientes</h2>
      <div className={styles.statsContainer}>
        <div className={styles.stat}>
          <h3>Total de Clientes</h3>
          <p className={styles.statNumber}>1,234</p>
        </div>
        <div className={styles.stat}>
          <h3>Clientes Nuevos</h3>
          <p className={styles.statNumber}>56</p>
        </div>
      </div>
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper}>
          <h3>Edad de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataEdad}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataEdad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartWrapper}>
          <h3>Género de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataGenero}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataGenero.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default EstadisticasClientes

