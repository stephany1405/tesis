import React, { useEffect, useState, useRef } from "react";
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
import jsPDF from "jspdf";
import logo from "../../../assets/logo.png";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const EstadisticasClientes = () => {
  const [statsData, setStatsData] = useState({
    totalClients: 0,
    newClients: 0,
    ageGroups: [],
    genderGroups: [],
  });

  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const ageChartRef = useRef(null);
  const genderChartRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = {};
        if (dateRange.start) params.start = dateRange.start;
        if (dateRange.end) params.end = dateRange.end;

        const { data } = await axios.get(
          "http://localhost:3000/api/estadistica/clientes",
          { params }
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
  }, [dateRange]);

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
    percentage:
      totalInAgeGroups > 0 ? (group.value / totalInAgeGroups) * 100 : 0,
  }));

  const genderGroupsWithPercentage = statsData.genderGroups.map((group) => ({
    ...group,
    percentage:
      totalInGenderGroups > 0 ? (group.value / totalInGenderGroups) * 100 : 0,
  }));

  const resetDates = () => {
    setDateRange({ start: "", end: "" });
  };

  const generatePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    const addPageIfNeeded = (heightNeeded) => {
      if (currentY + heightNeeded >= pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    const centerText = (text) => {
      const textWidth =
        (pdf.getStringUnitWidth(text) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor;
      return (pageWidth - textWidth) / 2;
    };

    const img = new Image();
    img.src = logo;
    pdf.addImage(img, "PNG", margin, currentY, 40, 15);
    currentY += 20;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = "REPORTE DE ESTADÍSTICAS DE CLIENTES";
    pdf.text(title, centerText(title), currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    const fechaGeneracion = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 35, "F");

    pdf.setFont("helvetica", "bold");
    pdf.text("Información del Reporte", margin + 5, currentY + 7);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Empresa: UÑIMAS`, margin + 5, currentY + 14);
    pdf.text(
      `Periodo: ${dateRange.start || "Inicio"} - ${dateRange.end || "Actual"}`,
      margin + 5,
      currentY + 21
    );
    pdf.text(
      `Fecha de Generación: ${fechaGeneracion}`,
      margin + 5,
      currentY + 28
    );
    currentY += 45;

    addPageIfNeeded(40);
    pdf.setFont("helvetica", "bold");
    pdf.text("RESUMEN DE CLIENTES", margin, currentY);
    currentY += 7;

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Total de Clientes: ${statsData.totalClients}`,
      margin + 5,
      currentY
    );
    currentY += 7;
    pdf.text(`Clientes Nuevos: ${statsData.newClients}`, margin + 5, currentY);
    currentY += 15;

    addPageIfNeeded(30 + statsData.ageGroups.length * 7);
    pdf.setFont("helvetica", "bold");
    pdf.text("Distribución por Edad:", margin, currentY);
    currentY += 7;
    pdf.setFont("helvetica", "normal");
    statsData.ageGroups.forEach((group) => {
      pdf.text(`${group.name}: ${group.value} clientes`, margin + 5, currentY);
      currentY += 7;
    });
    currentY += 10;

    addPageIfNeeded(20 + statsData.genderGroups.length * 7);
    pdf.setFont("helvetica", "bold");
    pdf.text("Distribución por Género:", margin, currentY);
    currentY += 7;
    pdf.setFont("helvetica", "normal");
    statsData.genderGroups.forEach((group) => {
      pdf.text(`${group.name}: ${group.value} clientes`, margin + 5, currentY);
      currentY += 7;
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
      pdf.text(`UÑIMAS - Reporte Confidencial`, margin, pageHeight - 10);
    }

    pdf.save("reporte_estadisticas_clientes.pdf");
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Clientes</h2>

      <div className={styles.dateFilters}>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
        />
        <span>a</span>
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
        <div className={styles.chartWrapper} ref={ageChartRef}>
          <h3 style={{ textAlign: "center" }}>Edad de Clientes</h3>
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

        <div className={styles.chartWrapper} ref={genderChartRef}>
          <h3 style={{ textAlign: "center" }}>Género de Clientes</h3>
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

      <button className={styles.pdfButton} onClick={generatePDF}>
        Descargar PDF
      </button>
    </div>
  );
};

export default EstadisticasClientes;
