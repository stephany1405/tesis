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
import jsPDF from "jspdf";
import logo from "../../../assets/logo.png";
const EstadisticasCitas = () => {
  const [statsData, setStatsData] = useState({
    monthlyData: [],
    popularServices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const parseSpanishDate = (dateString) => {
    const months = {
      enero: 0,
      febrero: 1,
      marzo: 2,
      abril: 3,
      mayo: 4,
      junio: 5,
      julio: 6,
      agosto: 7,
      septiembre: 8,
      octubre: 9,
      noviembre: 10,
      diciembre: 11,
    };

    const parts = dateString.split(/de |, | a\. m\.| p\. m\./);
    const [day, monthStr, year, time] = parts.filter((p) => p).slice(1);
    const [hours, minutes] = time
      .replace(" a. m.", "")
      .replace(" p. m.", "")
      .split(":")
      .map((n) => parseInt(n));

    const month = months[monthStr.toLowerCase().trim()];
    let hours24 = hours;

    if (dateString.includes("p. m.") && hours < 12) hours24 += 12;
    if (dateString.includes("a. m.") && hours === 12) hours24 = 0;

    return new Date(year, month, day, hours24, minutes);
  };

  const processMonthlyData = (appointments) => {
    const monthlyData = {};

    appointments.forEach((appointment) => {
      try {
        const dateStr = JSON.parse(appointment.scheduled_date).start;
        const appDate = parseSpanishDate(dateStr);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (
          (startDate && appDate < startDate) ||
          (endDate && appDate > endDate)
        ) {
          console.log("Cita excluida (fuera de rango):", appointment);
          return;
        }

        const monthKey = appDate.toLocaleString("es-ES", { month: "long" });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            name: monthKey,
            citas: 0,
            ingresos: 0,
            depositos: 0,
            appointments: [],
          };
        }

        monthlyData[monthKey].citas++;
        const amount = parseFloat(
          appointment.amount.replace(/[$,]/g, "").trim()
        );
        monthlyData[monthKey].ingresos += amount;
        const deposit = parseFloat(appointment.deposit_amount || 0);
        monthlyData[monthKey].depositos += deposit;
        monthlyData[monthKey].appointments.push(appointment);
      } catch (e) {
        console.error("Error parsing appointment:", e);
      }
    });

    return Object.values(monthlyData);
  };
  const processPopularServices = (appointments, services) => {
    const serviceCount = {};
    const servicesMap = new Map(services.map((s) => [s.id, s]));

    appointments.forEach((appointment) => {
      try {
        const dateStr = JSON.parse(appointment.scheduled_date).start;
        const appDate = parseSpanishDate(dateStr);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (
          (startDate && appDate < startDate) ||
          (endDate && appDate > endDate)
        ) {
          console.log(
            "Cita excluida (fuera de rango) en servicios:",
            appointment
          );
          return;
        }

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
      } catch (e) {
        console.error("Error parsing appointment:", e);
      }
    });

    return Object.values(serviceCount)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

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
  }, [dateRange]);

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

  const totalCitas = statsData.monthlyData.reduce(
    (sum, month) => sum + month.citas,
    0
  );
  const totalIngresos = statsData.monthlyData.reduce(
    (sum, month) => sum + month.ingresos,
    0
  );
  const totalDepositos = statsData.monthlyData.reduce(
    (sum, month) => sum + month.depositos,
    0
  );

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

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("UÑIMAS", margin, currentY);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "Av Casanova al frente de Damasco Sabana Grande",
      margin,
      currentY + 7
    );
    pdf.text("0412-1314372", margin, currentY + 14);
    currentY += 20;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = "REPORTE DE ESTADÍSTICAS DE CITAS";
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

    addPageIfNeeded(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("RESUMEN GENERAL", margin, currentY);
    currentY += 7;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Total de Citas: ${totalCitas}`, margin + 5, currentY);
    currentY += 7;
    pdf.text(
      `Ingresos Totales: $${totalIngresos.toFixed(2)}`,
      margin + 5,
      currentY
    );
    currentY += 7;
    pdf.text(
      `Depósitos Totales: $${totalDepositos.toFixed(2)}`,
      margin + 5,
      currentY
    );
    currentY += 15;

    addPageIfNeeded(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("ESTADÍSTICAS MENSUALES DETALLADAS", margin, currentY);
    currentY += 10;

    pdf.setFillColor(200, 200, 200);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 10, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("Mes", margin + 5, currentY + 7);
    pdf.text("Citas", margin + 45, currentY + 7);
    pdf.text("Ingresos", margin + 85, currentY + 7);
    pdf.text("Depósitos", margin + 125, currentY + 7);
    currentY += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    statsData.monthlyData.forEach((month) => {
      const lineHeight = pdf.getLineHeightFactor() * pdf.internal.getFontSize();
      let rowHeight = lineHeight;

      const monthDims = pdf.getTextDimensions(month.name);
      const citasDims = pdf.getTextDimensions(String(month.citas));
      const ingresosDims = pdf.getTextDimensions(
        `$${month.ingresos.toFixed(2)}`
      );
      const depositosDims = pdf.getTextDimensions(
        `$${month.depositos.toFixed(2)}`
      );

      const monthLines = monthDims.h / lineHeight;
      const citasLines = citasDims.h / lineHeight;
      const ingresosLines = ingresosDims.h / lineHeight;
      const depositosLines = depositosDims.h / lineHeight;

      rowHeight =
        Math.max(monthLines, citasLines, ingresosLines, depositosLines) *
        lineHeight;

      addPageIfNeeded(rowHeight + 2);

      pdf.text(
        month.name,
        margin + 5,
        currentY + rowHeight / 2 + lineHeight / 4
      );
      pdf.text(
        String(month.citas),
        margin + 45,
        currentY + rowHeight / 2 + lineHeight / 4
      );
      pdf.text(
        `$${month.ingresos.toFixed(2)}`,
        margin + 85,
        currentY + rowHeight / 2 + lineHeight / 4
      );
      pdf.text(
        `$${month.depositos.toFixed(2)}`,
        margin + 125,
        currentY + rowHeight / 2 + lineHeight / 4
      );

      currentY += rowHeight + 2;
    });
    currentY += 5;

    addPageIfNeeded(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("SERVICIOS MÁS SOLICITADOS", margin, currentY);
    currentY += 10;

    pdf.setFillColor(200, 200, 200);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 10, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("Servicio", margin + 5, currentY + 7);
    pdf.text("Cantidad", margin + 75, currentY + 7);
    pdf.text("Ingresos", margin + 115, currentY + 7);
    currentY += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    statsData.popularServices.forEach((service) => {
      const lineHeight = pdf.getLineHeightFactor() * pdf.internal.getFontSize();
      let rowHeight = lineHeight;

      const servicioDims = pdf.getTextDimensions(service.nombre);
      const cantidadDims = pdf.getTextDimensions(String(service.cantidad));
      const ingresosDims = pdf.getTextDimensions(
        `$${service.ingresos.toFixed(2)}`
      );

      const servicioLines = servicioDims.h / lineHeight;
      const cantidadLines = cantidadDims.h / lineHeight;
      const ingresosLines = ingresosDims.h / lineHeight;

      rowHeight =
        Math.max(servicioLines, cantidadLines, ingresosLines) * lineHeight;

      addPageIfNeeded(rowHeight + 2);

      pdf.text(
        service.nombre,
        margin + 5,
        currentY + rowHeight / 2 + lineHeight / 4
      );
      pdf.text(
        String(service.cantidad),
        margin + 75,
        currentY + rowHeight / 2 + lineHeight / 4
      );
      pdf.text(
        `$${service.ingresos.toFixed(2)}`,
        margin + 115,
        currentY + rowHeight / 2 + lineHeight / 4
      );

      currentY += rowHeight + 2;
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
      pdf.text(`UÑIMAS - Reporte Confidencial`, margin, pageHeight - 10);
    }

    pdf.save("reporte_estadisticas_citas.pdf");
  };
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Estadísticas de Citas</h2>

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
        <button className={styles.homeServiceButton} onClick={resetDates}>
          Reiniciar
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Citas</h3>
          <p className={styles.statValue}>{totalCitas}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Ingresos Totales</h3>
          <p className={styles.statValue}>${totalIngresos.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Depósitos Totales</h3>
          <p className={styles.statValue}>${totalDepositos.toFixed(2)}</p>
        </div>
      </div>

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
              <span className={styles.servicioNombre}>{servicio.nombre}</span>
              <span className={styles.servicioCantidad}>
                {servicio.cantidad} solicitudes
              </span>
              <span className={styles.servicioIngresos}>
                ${servicio.ingresos.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button className={styles.pdfButton} onClick={generatePDF}>
        Descargar PDF
      </button>
    </div>
  );
};

export default EstadisticasCitas;
