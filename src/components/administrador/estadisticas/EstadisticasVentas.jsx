import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import styles from "./EstadisticasVentas.module.css"

const data = [
  { name: "Ene", ventas: 4000 },
  { name: "Feb", ventas: 3000 },
  { name: "Mar", ventas: 5000 },
  { name: "Abr", ventas: 4500 },
  { name: "May", ventas: 6000 },
  { name: "Jun", ventas: 5500 },
]

const serviciosPopulares = [
  { nombre: "Corte de cabello", cantidad: 150 },
  { nombre: "Tinte", cantidad: 120 },
  { nombre: "Manicura", cantidad: 100 },
  { nombre: "Pedicura", cantidad: 80 },
  { nombre: "Depilación", cantidad: 60 },
]

const EstadisticasVentas = () => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Ventas</h2>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ventas" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.serviciosPopulares}>
        <h3>Servicios más populares</h3>
        <ul>
          {serviciosPopulares.map((servicio, index) => (
            <li key={index}>
              {servicio.nombre}: {servicio.cantidad} solicitudes
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default EstadisticasVentas

