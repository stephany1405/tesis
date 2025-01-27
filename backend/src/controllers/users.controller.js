import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { getRoleId, getRoleIdSpecialist } from "../models/user.model.js";

export const insertClient = async (req, res) => {
  const client = await pool.connect();
  try {
    const role = await getRoleId();

    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password,
      date_of_birth,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const tableName = "user";
    const schemaName = "public";

    const { rows: columns } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = $2",
      [tableName, schemaName]
    );

    const columnNames = columns.map((col) => col.column_name);

    const data = {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password: hashedPassword,
      role_id: RoleID,
      date_of_birth,
    };

    const filteredColumns = columnNames.filter(
      (col) => data[col] !== undefined
    );
    const filteredValues = filteredColumns.map((col) => data[col]);

    const placeholders = filteredColumns
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const query = `INSERT INTO public."${tableName}" (${filteredColumns.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;

    const { rows: createdUser } = await client.query(query, filteredValues);

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "Cliente creado exitosamente.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  } finally {
    if (client) client.release();
  }
};

export const insertSpecialist = async (req, res) => {
  const client = await pool.connect();
  try {
    const role = await getRoleIdSpecialist();

    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password,
      date_of_birth,
      specialization,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const tableName = "user";
    const schemaName = "public";

    const { rows: columns } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = $2",
      [tableName, schemaName]
    );

    const columnNames = columns.map((col) => col.column_name);

    const data = {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password: hashedPassword,
      role_id: RoleID,
      date_of_birth,
      specialization,
    };

    const filteredColumns = columnNames.filter(
      (col) => data[col] !== undefined
    );
    const filteredValues = filteredColumns.map((col) => data[col]);

    const placeholders = filteredColumns
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const query = `INSERT INTO public."${tableName}" (${filteredColumns.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;

    const { rows: createdUser } = await client.query(query, filteredValues);

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "Especialista creado exitosamente.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  } finally {
    if (client) client.release();
  }
};

export const getSpecialistsWithHistory = async (req, res) => {
  try {
    const role = await getRoleIdSpecialist();
    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const client = await pool.connect();
    const query = {
      text: `WITH RankedSpecialists AS (
    SELECT 
        u.id AS specialist_id,
        u.name AS specialist_name,
        u.lastname AS specialist_lastname,
        u.identification AS specialist_identification,
        u.email AS specialist_email,
        u.telephone_number AS specialist_phone,
        u.picture_profile AS specialist_image,
        u.score AS specialist_rating,
        u.specialization AS specialist_specialty,
        
       
        a.id AS appointment_id,
        a.services AS appointment_services,
        a.amount AS service_amount,
        a.address AS service_address,
        a.point AS service_point,
        a.scheduled_date AS service_date,
        
        aspec.start_appointment AS service_start_time,
        aspec.end_appointment AS service_end_time,
        aspec.sessions_assigned AS service_sessions,
        aspec.earnings AS specialist_earnings,
        
        r.rating AS client_rating,
        r.rated_by AS rating_source,
        
        ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY a.scheduled_date DESC) AS rn
    FROM 
        "user" u
    LEFT JOIN 
        appointment_specialists aspec ON u.id = aspec.specialist_id
    LEFT JOIN 
        appointment a ON aspec.appointment_id = a.id
    LEFT JOIN 
        ratings r ON r.user_id = u.id AND r.appointment_id = a.id
    WHERE 
        u.role_id = $1
)
SELECT 
    specialist_id,
    specialist_name,
    specialist_lastname,
    specialist_identification,
    specialist_email,
    specialist_phone,
    specialist_image,
    specialist_rating,
    specialist_specialty,
    appointment_id,
    appointment_services,
    service_amount,
    service_address,
    service_point,
    service_date,
    service_start_time,
    service_end_time,
    service_sessions,
    specialist_earnings,
    client_rating,
    rating_source
FROM 
    RankedSpecialists
WHERE 
    rn = 1
ORDER BY 
    specialist_name ASC;`,
      values: [RoleID],
    };

    const { rows } = await client.query(query);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
  }
};

export const getClientsWithHistory = async (req, res) => {
  try {
    const role = await getRoleId();
    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const client = await pool.connect();
    const query = {
      text: `
        SELECT 
          u.id AS user_id,
          u.name AS client_name,
          u.lastname AS client_lastname,
          u.identification,
          u.telephone_number,
          u.email,
          u.picture_profile,
          u.score,
          a.scheduled_date,
          a.services,
          a.amount AS service_amount,
          a.address AS service_address,
		      a.point AS service_point,
          payment_class.classification_type AS payment_method,
          aspec.start_appointment,
          aspec.end_appointment,
          aspec.sessions_assigned AS service_sessions,
          spec.name AS specialist_name,
          spec.lastname AS specialist_lastname,
          spec.telephone_number AS specialist_phone
        FROM 
          public.user u
        LEFT JOIN 
          public.appointment a ON u.id = a.user_id
        LEFT JOIN 
          public.classification payment_class ON a.payment_method = payment_class.id
        LEFT JOIN 
          public.appointment_specialists aspec ON a.id = aspec.appointment_id
        LEFT JOIN 
          public.user spec ON aspec.specialist_id = spec.id
        WHERE 
          u.role_id = $1
        ORDER BY 
          a.scheduled_date DESC;

      `,
      values: [RoleID],
    };

    const { rows } = await client.query(query);

    const clients = rows.reduce((acc, row) => {
      const client = acc.find((c) => c.id === row.user_id);
      const serviceHistory = {
        date: row.scheduled_date,
        service:
          JSON.parse(row.services)
            ?.map((s) => s.title)
            .join(", ") || "N/A",
        price: row.service_amount,
        especialista: `${row.specialist_name} ${row.specialist_lastname}`,
        startTime: row.start_appointment,
        endTime: row.end_appointment,
        paymentMethod: row.payment_method,
        sessions: row.service_sessions,
        address: row.service_address,
        point: row.service_point,
      };

      if (client) {
        client.serviceHistory.push(serviceHistory);
      } else {
        acc.push({
          id: row.user_id,
          name: row.client_name,
          lastname: row.client_lastname,
          identification: row.identification,
          telephone_number: row.telephone_number,
          email: row.email,
          picture_profile: row.picture_profile,
          score: row.score,
          serviceHistory: [serviceHistory],
        });
      }
      return acc;
    }, []);

    res.status(200).json(clients);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al obtener clientes con historial." });
  }
};

export const blockUser = async (req, res) => {
  try {
    const client = await pool.connect();
    const { id } = req.body;
    const query = `UPDATE public.user SET status = false WHERE id = $1`,
      values = [id];
    const result = await client.query(query, values);
    res.status(200).json({ message: "Usuario bloqueado exitosamente." });
  } catch (error) {
    console.log(error);
  }
};

export const unlockUser = async (req, res) => {
  try {
    const client = await pool.connect();
    const { id } = req.body;
    const query = `UPDATE public.user SET status = true WHERE id = $1`,
      values = [id];
    const result = await client.query(query, values);
    res.status(200).json({ message: "Usuario desbloqueado exitosamente." });
  } catch (error) {
    console.log(error);
  }
};
