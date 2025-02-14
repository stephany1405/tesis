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
export const getClientStatistics = async (req, res) => {
  try {
    let { start, end } = req.query;

    let startDate, endDate;
    if (!start && !end) {
      const today = new Date();
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = start ? new Date(start) : null;
      endDate = end ? new Date(end) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);
    }

    const totalClientsResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM public.user
      WHERE role_id = 57 
        AND status = true
    `);

    let conditions = [];
    let values = [];
    if (startDate) {
      values.push(startDate.toISOString());
      conditions.push(`created_at >= $${values.length}`);
    }
    if (endDate) {
      values.push(endDate.toISOString());
      conditions.push(`created_at <= $${values.length}`);
    }
    const newClientsQuery = `
      SELECT COUNT(*) as new_clients
      FROM public.user
      WHERE role_id = 57
        AND status = true
        ${conditions.length ? "AND " + conditions.join(" AND ") : ""}
    `;
    const newClientsResult = await pool.query(newClientsQuery, values);

    const ageGroupsQuery = `
  SELECT 
    CASE 
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 18 AND 25 THEN '18-25'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 26 AND 35 THEN '26-35'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 36 AND 45 THEN '36-45'
      ELSE '46+'
    END AS name,
    COUNT(*) AS value
  FROM public.user
  WHERE role_id = 57
    AND status = true
  GROUP BY 
    CASE 
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 18 AND 25 THEN '18-25'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 26 AND 35 THEN '26-35'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 36 AND 45 THEN '36-45'
      ELSE '46+'
    END
  ORDER BY name
`;

    const ageGroupsResult = await pool.query(ageGroupsQuery);

    const genderGroupsQuery = `
      SELECT 
        CASE 
          WHEN gender = 'femenino' THEN 'Femenino'
          WHEN gender = 'masculino' THEN 'Masculino'
          ELSE 'No especificado'
        END AS name, 
        COUNT(*) AS value
      FROM public.user
      WHERE role_id = 57
        AND status = true
      GROUP BY gender
      ORDER BY name
    `;
    const genderGroupsResult = await pool.query(genderGroupsQuery);

    res.json({
      totalClients: totalClientsResult.rows[0].total,
      newClients: newClientsResult.rows[0]?.new_clients || 0,
      ageGroups: ageGroupsResult.rows,
      genderGroups: genderGroupsResult.rows,
    });
  } catch (error) {
    console.error("Error en getClientStatistics:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getSpecialistStatistics = async (req, res) => {
  try {
    const { start, end } = req.query;

    const startDate = start ? new Date(start).toISOString() : null;
    const endDate = end ? new Date(end + "T23:59:59").toISOString() : null;

    const query = `
      SELECT 
        u.id,
        u.name || ' ' || u.lastname AS nombre,
        COUNT(DISTINCT aps.appointment_id) AS citasCompletadas,
        COALESCE(SUM(aps.earnings), 0) AS ingresos
      FROM 
        public.user u
      LEFT JOIN 
        appointment_specialists aps ON u.id = aps.specialist_id
        AND aps.status_id = 73 
        ${startDate ? "AND aps.start_appointment >= $1" : ""}
        ${endDate ? "AND aps.start_appointment <= $2" : ""}
      WHERE 
        u.role_id = 58
      GROUP BY 
        u.id, u.name, u.lastname
      ORDER BY 
        ingresos DESC;
    `;

    const result = await pool.query(
      query,
      [startDate, endDate].filter(Boolean)
    );

    const processedData = result.rows.map((row) => ({
      nombre: row.nombre,
      citasCompletadas: parseInt(row.citascompletadas),
      ingresos: parseFloat(row.ingresos),
    }));

    res.json(processedData);
  } catch (error) {
    console.error("Error en getSpecialistStatistics:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const dashboardConnect = async (req, res) => {
  try {
    const { start, end } = req.query;

    const { rows } = await pool.query(
      `SELECT ID FROM classification WHERE classification_type = 'Asignando especialista'`
    );
    const status_id = parseInt(rows[0].id);

    let newClientsQuery = `
      SELECT COUNT(*) as new_clients
      FROM public.user
      WHERE role_id = 57
      AND status = true
    `;
    const newClientsValues = [];
    if (start && end) {
      newClientsQuery += ` AND DATE(created_at) BETWEEN $1 AND $2`;
      newClientsValues.push(start, end);
    } else {
      newClientsQuery += ` AND DATE(created_at) = CURRENT_DATE`;
    }
    const newClientsResult = await pool.query(
      newClientsQuery,
      newClientsValues
    );

    let servicesQuery = `SELECT COUNT(*) as service FROM PUBLIC.APPOINTMENT`;
    const servicesValues = [];
    if (start && end) {
      servicesQuery += ` WHERE DATE(created_at) BETWEEN $1 AND $2`;
      servicesValues.push(start, end);
    }
    const services = await pool.query(servicesQuery, servicesValues);

    let pendingQuotesQuery = `
      SELECT COUNT(*) as pendingQuotes 
      FROM PUBLIC.APPOINTMENT 
      WHERE status_id = $1
    `;
    const pendingQuotesValues = [status_id];
    if (start && end) {
      pendingQuotesQuery += ` AND DATE(created_at) BETWEEN $2 AND $3`;
      pendingQuotesValues.push(start, end);
    }
    const pendingQuotes = await pool.query(
      pendingQuotesQuery,
      pendingQuotesValues
    );
    res.status(200).json({
      newClientsResult: newClientsResult.rows[0].new_clients || 0,
      services: services.rows[0].service || 0,
      pendingQuotes: pendingQuotes.rows[0].pendingquotes || 0,
    });
  } catch (error) {
    console.error("Error en dashboardConnect:", error);
    res.status(500).json({ error: "error interno en el servidor" });
  }
};

export const getPaymentMethod = async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = `
      SELECT 
        CASE
          WHEN "payment_method" = 59 THEN 'Tarjeta'
          WHEN "payment_method" = 69 THEN 'Pago Móvil'
          WHEN "payment_method" = 68 THEN 'Efectivo'
          ELSE 'Otro'
        END AS metodo,
        COUNT(*) AS cantidad
      FROM appointment
    `;
    const values = [];
    if (start && end) {
      query += ` WHERE "created_at" BETWEEN $1 AND $2`;
      values.push(start, end);
    }
    query += ` GROUP BY "payment_method"`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los métodos de pago:", error);
    res.status(500).json({ error: "Error al obtener los métodos de pago" });
  }
};
