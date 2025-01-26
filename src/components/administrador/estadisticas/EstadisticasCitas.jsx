import React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import styles from "./EstadisticasCitas.module.css"

const data = [
  { hora: "9:00", citas: 4 },
  { hora: "10:00", citas: 6 },
  { hora: "11:00", citas: 8 },
  { hora: "12:00", citas: 10 },
  { hora: "13:00", citas: 7 },
  { hora: "14:00", citas: 5 },
  { hora: "15:00", citas: 9 },
  { hora: "16:00", citas: 11 },
  { hora: "17:00", citas: 8 },
  { hora: "18:00", citas: 6 },
]

const EstadisticasCitas = () => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Citas</h2>
      <div className={styles.chartContainer}>
        <h3>Horas Pico de Atención</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="citas" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EstadisticasCitas

