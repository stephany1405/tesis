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
    const client = await pool.connect();

    const totalClientsResult = await client.query(`
      SELECT COUNT(*) as total
      FROM public.USER
      WHERE role_id = 57 AND status = true
    `);

    const newClientsResult = await client.query(`
      SELECT COUNT(*) as new_clients
      FROM public.USER
      WHERE role_id = 57 
      AND status = true
      AND DATE(created_at) = CURRENT_DATE
    `);

    const ageGroupsResult = await client.query(`
      WITH age_calc AS (
        SELECT 
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth::date)) as age
        FROM public.USER
        WHERE role_id = 57 AND status = true
      )
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          ELSE '46+'
        END as name,
        COUNT(*) as value
      FROM age_calc
      GROUP BY name
      ORDER BY name
    `);

    const genderGroupsResult = await client.query(`
    SELECT 
    CASE 
        WHEN gender = 'femenino' THEN 'Femenino'
        WHEN gender = 'masculino' THEN 'Masculino'
        ELSE 'No especificado' 
    END AS name, 
    COUNT(*) AS value
    FROM public."user"
    WHERE role_id = 57 AND status = TRUE 
    GROUP BY gender  -- Incluir "gender" aquí
    ORDER BY name;
    `);

    client.release();

    res.json({
      totalClients: totalClientsResult.rows[0].total,
      newClients: newClientsResult.rows[0].new_clients,
      ageGroups: ageGroupsResult.rows,
      genderGroups: genderGroupsResult.rows,
    });
  } catch (error) {
    console.error("Error en getClientStatistics:", error);
    res.status(500).json({ error: "error interno en el servidor" });
  }
};
export const getSpecialistStatistics = async (req, res) => {
  try {
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
      WHERE 
        u.role_id = 58
      GROUP BY 
        u.id, u.name, u.lastname
      ORDER BY 
        ingresos DESC;
      `;

    const result = await pool.query(query);

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
export const getPaymentMethod = async (req, res) => {
  try {
    const query = `
      SELECT 
        CASE
          WHEN "payment_method" = 59 THEN 'Tarjeta'
          WHEN "payment_method" = 69 THEN 'Pago Móvil'
          WHEN "payment_method" = 68 THEN 'Efectivo'
          ELSE 'Otro'
        END AS metodo,
        COUNT(*) AS cantidad
      FROM appointment
      GROUP BY "payment_method"
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los métodos de pago:", error);
    res.status(500).json({ error: "Error al obtener los métodos de pago" });
  }
};
