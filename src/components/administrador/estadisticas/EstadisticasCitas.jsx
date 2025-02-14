import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./EstadisticasCitas.module.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../../assets/logo.png";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const EstadisticasCitas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const chartContainerRef = useRef(null);

  const resetDates = () => {
    setDateRange({ start: "", end: "" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (dateRange.start && dateRange.end) {
          params.start = dateRange.start;
          params.end = dateRange.end;
        }
        const response = await axios.get(
          "http://localhost:3000/api/estadistica/metodosPago",
          { params }
        );
        const formattedData = response.data.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad),
        }));
        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error al obtener las estadísticas de métodos de pago:",
          error
        );
        setError("Error al cargar los datos");
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
    pdf.text(
      "REPORTE DE MÉTODOS DE PAGO",
      centerText("REPORTE DE MÉTODOS DE PAGO"),
      currentY
    );
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
    pdf.text("RESUMEN EJECUTIVO", margin, currentY);
    currentY += 7;

    pdf.setFont("helvetica", "normal");
    let totalCantidad = data.reduce((sum, item) => sum + item.cantidad, 0);
    data.forEach((item, index) => {
      let percentage = ((item.cantidad / totalCantidad) * 100).toFixed(2);
      pdf.text(`• ${item.metodo}: ${percentage}%`, margin + 5, currentY);
      currentY += 7;
    });
    currentY += 10;

    addPageIfNeeded(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("DETALLE POR MÉTODO DE PAGO", margin, currentY);
    currentY += 10;

    const headers = ["Método de Pago", "Cantidad"];
    const colWidth = (pageWidth - 2 * margin) / 2;

    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 8, "F");
    headers.forEach((header, i) => {
      pdf.text(header, margin + colWidth * i + 5, currentY);
    });
    currentY += 8;

    pdf.setFont("helvetica", "normal");
    data.forEach((item) => {
      if (addPageIfNeeded(10)) {
        currentY += 5;
        pdf.setFont("helvetica", "bold");
        headers.forEach((header, i) => {
          pdf.text(header, margin + colWidth * i + 5, currentY);
        });
        currentY += 8;
        pdf.setFont("helvetica", "normal");
      }
      pdf.text(item.metodo, margin + 5, currentY);
      pdf.text(String(item.cantidad), margin + colWidth + 5, currentY);
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

    pdf.save("reporte_metodos_pago.pdf");
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.card}>
      <div ref={chartContainerRef} style={{ textAlign: "center" }}>
        <h2 className={styles.cardTitle}>Métodos de Pago</h2>
        <div
          className={styles.chartContainer}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <ResponsiveContainer width="80%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="cantidad"
                nameKey="metodo"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

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
      <div className={styles.statsGrid}>
        {data.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <h4 style={{ color: COLORS[index % COLORS.length] }}>
              {item.metodo}
            </h4>
            <p>{item.cantidad}</p>
          </div>
        ))}
      </div>
      <button className={styles.pdfButton} onClick={generatePDF}>
        Descargar PDF
      </button>
    </div>
  );
};

export default EstadisticasCitas;
