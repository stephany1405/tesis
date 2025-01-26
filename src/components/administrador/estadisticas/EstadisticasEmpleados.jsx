import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import styles from "./EstadisticasEmpleados.module.css"

const data = [
  { nombre: "Ana", productividad: 85, horasTrabajadas: 160 },
  { nombre: "Carlos", productividad: 78, horasTrabajadas: 152 },
  { nombre: "María", productividad: 92, horasTrabajadas: 168 },
  { nombre: "Juan", productividad: 88, horasTrabajadas: 160 },
  { nombre: "Laura", productividad: 95, horasTrabajadas: 176 },
]

const EstadisticasEmpleados = () => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Empleados</h2>
      <div className={styles.chartContainer}>
        <h3>Productividad y Horas Trabajadas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="productividad" fill="#8884d8" name="Productividad (%)" />
            <Bar yAxisId="right" dataKey="horasTrabajadas" fill="#82ca9d" name="Horas Trabajadas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EstadisticasEmpleados

