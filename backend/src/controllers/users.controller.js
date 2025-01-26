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

export const getSpecialists = async (req, res) => {
  try {
    const role = await getRoleIdSpecialist();
    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const client = await pool.connect();
    const query = {
      text: `SELECT id, name, lastname,   picture_profile, FROM public.user WHERE role_id = $1`,
      values: [RoleID],
    };

    const { rows } = await client.query(query);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
  }
};

export const getClients = async (req, res) => {
  try {
    const role = await getRoleId();
    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const client = await pool.connect();
    const query = {
      text: `SELECT id,name, lastname, identification, telephone_number, email, score, picture_profile FROM public.user WHERE role_id = $1`,
      values: [RoleID],
    };

    const { rows } = await client.query(query);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
  }
};
