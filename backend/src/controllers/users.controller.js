import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { getRoleId, getRoleIdSpecialist } from "../models/user.model.js";

export const insertClient = async (req, res) => {
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
      gender,
      email,
      telephone_number,
      password,
      date_of_birth,
      security_question,
      security_answer,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const tableName = "user";
    const schemaName = "public";

    const { rows: columns } = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = $2",
      [tableName, schemaName]
    );

    const columnNames = columns.map((col) => col.column_name);

    const data = {
      name,
      lastname,
      identification,
      gender,
      email,
      telephone_number,
      password: hashedPassword,
      role_id: RoleID,
      date_of_birth,
      security_question,
      security_answer,
      picture_profile: "/uploads/profile-pics/user.webp",
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

    const { rows: createdUser } = await pool.query(query, filteredValues);

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "Usuario creado exitosamente.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

export const insertSpecialist = async (req, res) => {
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
      specialties,
      security_question,
      security_answer,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const tableName = "user";
    const schemaName = "public";

    const { rows: columns } = await pool.query(
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
      specialization: specialties,
      picture_profile: "/uploads/profile-pics/user.webp",
      security_question,
      security_answer,
    };
    console.log("Datos a insertar:", data);
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

    const { rows: createdUser } = await pool.query(query, filteredValues);

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "Especialista creado exitosamente.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

export const getSpecialistsWithHistory = async (req, res) => {
  try {
    const role = await getRoleIdSpecialist();
    if (!role) {
      return res
        .status(400)
        .json({ message: "Rol de especialista no encontrado." });
    }
    const RoleID = role.id;

    const query = {
      text: `
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
                  u.status as status_user,
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
                  r.rated_by AS rating_source
              FROM "user" u
              LEFT JOIN appointment_specialists aspec ON u.id = aspec.specialist_id
              LEFT JOIN appointment a ON aspec.appointment_id = a.id
              LEFT JOIN ratings r ON r.user_id = u.id AND r.appointment_id = a.id  -- Join con ratings
              WHERE u.role_id = $1
              ORDER BY specialist_name ASC, a.scheduled_date DESC;  -- Ordena por nombre y fecha
          `,
      values: [RoleID],
    };
    const { rows } = await pool.query(query.text, query.values);

    const specialists = [];
    rows.forEach((row) => {
      let specialist = specialists.find(
        (s) => s.specialist_id === row.specialist_id
      );
      if (!specialist) {
        specialist = {
          specialist_id: row.specialist_id,
          specialist_name: row.specialist_name,
          specialist_lastname: row.specialist_lastname,
          specialist_identification: row.specialist_identification,
          specialist_email: row.specialist_email,
          specialist_phone: row.specialist_phone,
          specialist_image: row.specialist_image,
          specialist_rating: row.specialist_rating,
          specialist_specialty: row.specialist_specialty,
          status_user: row.status_user,
          appointments: [],
        };
        specialists.push(specialist);
      }

      if (row.appointment_id) {
        specialist.appointments.push({
          appointment_id: row.appointment_id,
          appointment_services: row.appointment_services,
          service_amount: row.service_amount,
          service_address: row.service_address,
          service_point: row.service_point,
          service_date: row.service_date,
          service_start_time: row.service_start_time,
          service_end_time: row.service_end_time,
          service_sessions: row.service_sessions,
          specialist_earnings: row.specialist_earnings,
          client_rating: row.client_rating,
          rating_source: row.rating_source,
        });
      }
    });

    res.status(200).json(specialists);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error al obtener el historial de especialistas" });
  }
};

export const getClientsWithHistory = async (req, res) => {
  try {
    const role = await getRoleId();
    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const query = {
      text: `
        SELECT 
          u.id AS user_id,
          u.name AS client_name,
          u.lastname AS client_lastname,
          u.identification,
          u.telephone_number,
          u.email,
          u.gender,
          u.picture_profile,
          u.score,
          u.status AS status_user,
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

    const { rows } = await pool.query(query);
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
          status_user: row.status_user,
          gender: row.gender,
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
    const { id } = req.body;
    const query = `UPDATE public.user SET status = false WHERE id = $1`,
      values = [id];
    const result = await pool.query(query, values);
    res.status(200).json({ message: "Usuario bloqueado exitosamente." });
  } catch (error) {
    console.log(error);
  }
};

export const unlockUser = async (req, res) => {
  try {
    const { id } = req.body;
    const query = `UPDATE public.user SET status = true WHERE id = $1`,
      values = [id];
    const result = await pool.query(query, values);
    res.status(200).json({ message: "Usuario desbloqueado exitosamente." });
  } catch (error) {
    console.log(error);
  }
};
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "ID del Usuario es requerido." });
    }

    await pool.query("BEGIN");

    await pool.query(
      "DELETE FROM public.ratings WHERE appointment_id IN (SELECT id FROM public.appointment WHERE user_id = $1)",
      [id]
    );

    await pool.query(
      "DELETE FROM public.specialist_cancelled_appointments WHERE appointment_id IN (SELECT id FROM public.appointment WHERE user_id = $1)",
      [id]
    );
    await pool.query(
      "DELETE FROM public.appointment_specialists WHERE appointment_id IN (SELECT id FROM public.appointment WHERE user_id = $1)",
      [id]
    );

    await pool.query(
      "DELETE FROM public.appointment_specialists WHERE specialist_id = $1",
      [id]
    );

    await pool.query("DELETE FROM public.appointment WHERE user_id = $1", [id]);

    await pool.query("DELETE FROM public.user WHERE id = $1", [id]);

    await pool.query("COMMIT");

    res.status(200).json({ message: "Usuario Eliminado Exitosamente." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
};

export const identification = async (req, res) => {
  try {
    const { identification } = req.params;

    const result = await pool.query(
      "SELECT id FROM public.user WHERE identification = $1",
      [identification]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar identificación:", error);
    res.status(500).json({ message: "Error al verificar identificación" });
  }
};

export const email = async (req, res) => {
  try {
    const { email } = req.params;

    const result = await pool.query(
      "SELECT id FROM public.user WHERE email = $1",
      [email]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar email:", error);
    res.status(500).json({ message: "Error al verificar email" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    if (fields.length === 0) {
      return res.status(200).json({
        message: "No hay cambios para actualizar",
      });
    }

    values.push(id);

    const query = `
      UPDATE public.user 
      SET ${fields.join(", ")} 
      WHERE id = $${paramIndex}
      RETURNING id, name, lastname, identification, email, telephone_number, status, picture_profile, score

    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Usuario actualizado exitosamente",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

export const updateSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === "specialties") {
        setClauses.push(`specialization = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    });

    if (setClauses.length === 0) {
      return res
        .status(400)
        .json({ message: "No hay campos válidos para actualizar" });
    }

    values.push(id);

    const query = `
          UPDATE public.user
          SET ${setClauses.join(", ")}
          WHERE id = $${paramIndex}
          RETURNING
              id,
              name AS specialist_name,
              lastname AS specialist_lastname,
              identification AS specialist_identification,
              email AS specialist_email,
              telephone_number AS specialist_phone,
              picture_profile AS specialist_image,
              score AS specialist_rating,
              status AS status_user,
              specialization AS specialties
      `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Especialista no encontrado" });
    }

    const specialist = result.rows[0];
    if (specialist.specialties && typeof specialist.specialties === "string") {
      specialist.specialties = JSON.parse(specialist.specialties);
    }

    res.status(200).json({
      message: "Especialista actualizado exitosamente",
      specialist,
    });
  } catch (error) {
    console.error("Error al actualizar especialista:", error);
    res.status(500).json({ message: "Error al actualizar especialista" });
  }
};
