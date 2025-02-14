import React, { useState, useEffect, useRef } from "react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./EstadisticasEmpleados.module.css";
import logo from "../../../assets/logo.png";

const EstadisticasEmpleados = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("ingresos");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          start: dateRange.start || null,
          end: dateRange.end || null,
        };

        const response = await axios.get(
          "http://localhost:3000/api/estadistica/especialistas",
          { params }
        );

        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error al cargar los datos");
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const generatePDF = async () => {
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

    const centerText = (text, y) => {
      const textWidth =
        (pdf.getStringUnitWidth(text) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor;
      return (pageWidth - textWidth) / 2;
    };

    const calculateAverageByCita = (ingresos, citas) => {
      if (!citas || citas === 0) return "Sin citas";
      const promedio = ingresos / citas;
      return isNaN(promedio) ? "Sin datos" : `$${promedio.toFixed(2)}`;
    };

    const img = new Image();
    img.src = logo;
    pdf.addImage(img, "PNG", margin, currentY, 40, 15);

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "REPORTE DE ESTADÍSTICAS",
      centerText("REPORTE DE ESTADÍSTICAS", currentY + 10),
      currentY + 10
    );
    currentY += 25;

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

    addPageIfNeeded(60);
    pdf.setFont("helvetica", "bold");
    pdf.text("RESUMEN EJECUTIVO", margin, currentY);
    currentY += 7;

    pdf.setFont("helvetica", "normal");
    const sortedData = [...data]
      .sort((a, b) => b[selectedMetric] - a[selectedMetric])
      .slice(0, 10);
    const totalIngresos = sortedData
      .reduce((sum, item) => sum + (item.ingresos || 0), 0)
      .toFixed(2);
    const totalCitas = sortedData.reduce(
      (sum, item) => sum + (item.citasCompletadas || 0),
      0
    );

    const especialistasActivos = sortedData.filter(
      (item) => item.citasCompletadas > 0
    );
    const promedioIngresos =
      especialistasActivos.length > 0
        ? (totalIngresos / especialistasActivos.length).toFixed(2)
        : "Sin datos";

    pdf.text(`• Ingresos Totales: $${totalIngresos}`, margin + 5, currentY + 7);
    pdf.text(
      `• Total de Citas Completadas: ${totalCitas}`,
      margin + 5,
      currentY + 14
    );
    pdf.text(
      `• Promedio de Ingresos por Especialista Activo: ${promedioIngresos}`,
      margin + 5,
      currentY + 21
    );
    currentY += 35;

    addPageIfNeeded(100);
    pdf.setFont("helvetica", "bold");
    pdf.text("DETALLE POR ESPECIALISTA", margin, currentY);
    currentY += 10;

    const headers = [
      "Especialista",
      "Ingresos",
      "Citas Completadas",
      "Promedio por Cita",
    ];
    const colWidth = (pageWidth - 2 * margin) / 4;

    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 8, "F");
    headers.forEach((header, i) => {
      pdf.text(header, margin + colWidth * i, currentY);
    });
    currentY += 8;

    pdf.setFont("helvetica", "normal");
    sortedData.forEach((item, index) => {
      if (addPageIfNeeded(10)) {
        currentY += 5;
        pdf.setFont("helvetica", "bold");
        headers.forEach((header, i) => {
          pdf.text(header, margin + colWidth * i, currentY);
        });
        currentY += 8;
        pdf.setFont("helvetica", "normal");
      }

      const promedioPorCita = calculateAverageByCita(
        item.ingresos,
        item.citasCompletadas
      );
      pdf.text(item.nombre, margin, currentY);
      pdf.text(`$${item.ingresos.toFixed(2)}`, margin + colWidth, currentY);
      pdf.text(
        item.citasCompletadas.toString(),
        margin + colWidth * 2,
        currentY
      );
      pdf.text(promedioPorCita, margin + colWidth * 3, currentY);
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

    pdf.save("reporte_estadisticas_especialistas.pdf");
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const sortedData = [...data]
    .sort((a, b) => b[selectedMetric] - a[selectedMetric])
    .slice(0, 10);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Top 10 Especialistas</h2>

      <div className={styles.controls}>
        <div className={styles.dateFilters}>
          <div className={styles.dateInputs}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <span> a </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <div ref={chartRef} className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" orientation="bottom" />
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

      <button className={styles.pdfButton} onClick={generatePDF}>
        Descargar PDF
      </button>
    </div>
  );
};

export default EstadisticasEmpleados;
