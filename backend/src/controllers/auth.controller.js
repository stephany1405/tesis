import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.lib.js";

export const register = async (req, res) => {
  const client = await pool.connect();
  try {

    const { rows: roleRows } = await client.query(
      'SELECT id FROM public."classification" WHERE classification_type = $1',
      ["usuario"]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ message: "Rol de Usuario no encontrado." });
    }
    const RoleID = roleRows[0].id;

    const {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password,
      date_of_birth,
    } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const token = await createAccessToken({ email: createdUser[0].email, role_id: createdUser[0].role_id });
    res.cookie("token", token);

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  } finally {
    if (client) client.release();
  }
};

export const login = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password } = req.body;

    const { rows } = await client.query(
      "SELECT email, password, role_id FROM public.user WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Usuario no encontrado" });

    const user = rows[0];
    const userEmail = user.email;
    const userPassword = user.password;
    const userRole = user.role_id;
    const comparePassword = await bcrypt.compare(password, userPassword);

    if (!comparePassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = await createAccessToken({ email: userEmail, role_id: userRole });

    res.cookie("token", token);
    res.json({ message: "Usuario logeado exitosamente.", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    if (client) client.release();
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};