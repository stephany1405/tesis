import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import styles from "./EstadisticasClientes.module.css";
import axios from "axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const EstadisticasClientes = () => {
  const [statsData, setStatsData] = useState({
    totalClients: 0,
    newClients: 0,
    ageGroups: [],
    genderGroups: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/estadistica/clientes"
        );
        const processedData = {
          ...data,
          totalClients: Number.parseInt(data.totalClients),
          newClients: Number.parseInt(data.newClients),
          ageGroups: data.ageGroups.map((group) => ({
            ...group,
            value: Number.parseInt(group.value),
          })),
          genderGroups: data.genderGroups.map((group) => ({
            ...group,
            value: Number.parseInt(group.value),
          })),
        };
        setStatsData(processedData);
      } catch (error) {
        console.error("Error get estadisticas:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const totalInAgeGroups = statsData.ageGroups.reduce(
    (sum, group) => sum + group.value,
    0
  );

  const totalInGenderGroups = statsData.genderGroups.reduce(
    (sum, group) => sum + group.value,
    0
  );

  const ageGroupsWithPercentage = statsData.ageGroups.map((group) => ({
    ...group,
    percentage: (group.value / totalInAgeGroups) * 100,
  }));

  const genderGroupsWithPercentage = statsData.genderGroups.map((group) => ({
    ...group,
    percentage: (group.value / totalInGenderGroups) * 100,
  }));

  if (!statsData.ageGroups || statsData.ageGroups.length === 0) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Clientes</h2>
      <div className={styles.statsContainer}>
        <div className={styles.stat}>
          <h3>Total de Clientes</h3>
          <p className={styles.statNumber}>{statsData.totalClients}</p>
        </div>
        <div className={styles.stat}>
          <h3>Clientes Nuevos</h3>
          <p className={styles.statNumber}>{statsData.newClients}</p>
        </div>
      </div>
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper}>
          <h3>Edad de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupsWithPercentage}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${percentage.toFixed(1)}%`}
              >
                {ageGroupsWithPercentage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${props.payload.percentage.toFixed(1)}% (${value})`,
                  name,
                ]}
              />
              <Legend
                formatter={(value, entry) =>
                  `${value}: ${entry.payload.percentage.toFixed(1)}% (${
                    entry.payload.value
                  })`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartWrapper}>
          <h3>Género de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderGroupsWithPercentage}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${percentage.toFixed(1)}%`}
              >
                {genderGroupsWithPercentage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${props.payload.percentage.toFixed(1)}% (${value})`,
                  name,
                ]}
              />
              <Legend
                formatter={(value, entry) =>
                  `${value}: ${entry.payload.percentage.toFixed(1)}% (${
                    entry.payload.value
                  })`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasClientes;
