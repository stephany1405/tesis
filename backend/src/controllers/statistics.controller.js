import { pool } from "../db.js";

export const getAppointmentStatistics = async (req, res) => {
  try {
    const appointmentsQuery = `
      SELECT 
        a.id,
        a.services,
        a.amount,
        ROUND((CAST(REPLACE(REPLACE(a.amount, '$', ''), ',', '') AS numeric) * 0.20)::numeric, 2) as deposit_amount,
        a.scheduled_date,
        a.status_id,
        a.created_at
      FROM appointment a
      WHERE a.created_at >= NOW() - INTERVAL '6 months'
      ORDER BY a.created_at DESC
    `;

    const { rows: appointments } = await pool.query(appointmentsQuery);

    const servicesQuery = `
      SELECT 
        c.id,
        c.classification_type as title,
        c.price,
        c.time as duration,
        c.description
      FROM classification c
      WHERE c.price IS NOT NULL
    `;

    const { rows: services } = await pool.query(servicesQuery);

    res.json({
      success: true,
      data: {
        appointments,
        services,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de citas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de citas",
      error: error.message,
    });
  }
};
