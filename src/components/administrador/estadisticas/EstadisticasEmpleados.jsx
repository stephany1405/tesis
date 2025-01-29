import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import styles from "./EstadisticasEmpleados.module.css";

const EstadisticasEmpleados = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("ingresos");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/estadistica/especialistas"
        );
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error al cargar los datos");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const sortedData = [...data]
    .sort((a, b) => b[selectedMetric] - a[selectedMetric])
    .slice(0, 10);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Top 10 Especialistas</h2>
      <div className={styles.controls}>
        <label htmlFor="metricSelect">Ordenar por: </label>
        <select
          id="metricSelect"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className={styles.select}
        >
          <option value="ingresos">Ingresos</option>
          <option value="citasCompletadas">Citas Completadas</option>
        </select>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="nombre" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={selectedMetric}
              fill={selectedMetric === "ingresos" ? "#8884d8" : "#82ca9d"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EstadisticasEmpleados;
