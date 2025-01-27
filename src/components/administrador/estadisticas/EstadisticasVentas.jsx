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
import styles from "./EstadisticasVentas.module.css";

const EstadisticasCitas = () => {
  const [statsData, setStatsData] = useState({
    monthlyData: [],
    popularServices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/estadistica/citas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar las estadísticas");
        }

        const { data } = await response.json();

        if (data) {
          const monthlyStats = processMonthlyData(data.appointments);
          const popularServices = processPopularServices(
            data.appointments,
            data.services
          );

          setStatsData({
            monthlyData: monthlyStats,
            popularServices: popularServices,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const processMonthlyData = (appointments) => {
    const monthlyData = {};

    appointments.forEach((appointment) => {
      const date = JSON.parse(appointment.scheduled_date).start;
      const monthKey = date.toLocaleString("default", { month: "short" });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          name: monthKey,
          citas: 0,
          ingresos: 0,
          depositos: 0,
        };
      }

      monthlyData[monthKey].citas++;

      const amount = parseFloat(appointment.amount.replace(/[$,]/g, "").trim());
      monthlyData[monthKey].ingresos += amount;

      const deposit = parseFloat(appointment.deposit_amount || 0);
      monthlyData[monthKey].depositos += deposit;

      console.log(`Mes: ${monthlyData[monthKey].name}`);
    });

    return Object.values(monthlyData).sort((a, b) => {
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octumbre",
        "Noviembre",
        "Diciembre",
      ];
      return months.indexOf(a.name) - months.indexOf(b.name);
    });
  };
  const processPopularServices = (appointments, services) => {
    const serviceCount = {};

    const servicesMap = new Map(services.map((s) => [s.id, s]));

    appointments.forEach((appointment) => {
      const servicesArr = JSON.parse(appointment.services);
      servicesArr.forEach((service) => {
        const serviceId = service.id;
        const serviceInfo = servicesMap.get(serviceId);

        if (serviceInfo) {
          if (!serviceCount[serviceId]) {
            serviceCount[serviceId] = {
              nombre: serviceInfo.title,
              cantidad: 0,
              ingresos: 0,
            };
          }
          serviceCount[serviceId].cantidad += service.quantity;
          serviceCount[serviceId].ingresos +=
            parseFloat(service.price) * service.quantity;
        }
      });
    });

    return Object.values(serviceCount)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Cargando estadísticas...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Citas</h2>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statsData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="citas"
              fill="#8884d8"
              name="Número de Citas"
            />
            <Bar
              yAxisId="right"
              dataKey="ingresos"
              fill="#82ca9d"
              name="Ingresos ($)"
            />
            <Bar
              yAxisId="right"
              dataKey="depositos"
              fill="#ff7300"
              name="Depósitos (20%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.serviciosPopulares}>
        <h3>Servicios más solicitados</h3>
        <ul>
          {statsData.popularServices.map((servicio, index) => (
            <li key={index}>
              {servicio.nombre}: {servicio.cantidad} solicitudes ($
              {servicio.ingresos.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EstadisticasCitas;
