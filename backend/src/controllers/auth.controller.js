import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.lib.js";
import { validationResult } from "express-validator";

export const register = async (req, res) => {
  const client = await pool.connect();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Obtener el RoleID para "usuario"
    const { rows: roleRows } = await client.query(
      'SELECT id FROM public."classification" WHERE classification_type = $1',
      ["usuario"]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ message: "Default role not found" });
    }
    const RoleID = roleRows[0].id;

    // Obtener datos del front-end
    const {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password,
      date_of_birth,
    } = req.body;

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tableName = "user";
    const schemaName = "public";

    // Obtener dinámicamente las columnas de la tabla
    const { rows: columns } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = $2",
      [tableName, schemaName]
    );

    const columnNames = columns.map((col) => col.column_name);

    // Crear un objeto de mapeo entre columnas y valores de req.body
    const data = {
      name,
      lastname,
      identification,
      email,
      telephone_number,
      password: hashedPassword, // Contraseña hasheada
      role_id: RoleID, // ID del rol
      date_of_birth,
    };

    // Filtrar solo las columnas y valores que existan en req.body
    const filteredColumns = columnNames.filter(
      (col) => data[col] !== undefined
    );
    const filteredValues = filteredColumns.map((col) => data[col]);

    // Crear placeholders dinámicos para la consulta
    const placeholders = filteredColumns
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const query = `INSERT INTO public."${tableName}" (${filteredColumns.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;

    // Ejecutar la consulta
    const { rows: createdUser } = await client.query(query, filteredValues);

    // Crear el token JWT
    const token = await createAccessToken({ email: createdUser[0].email });
    res.cookie("token", token);

    // Excluir la contraseña del usuario en la respuesta
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

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const { rows } = await client.query(
      "SELECT email, password FROM public.user WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "User  not found" });

    const user = rows[0];
    const userEmail = user.email;
    const userPassword = user.password;
    const comparePassword = await bcrypt.compare(password, userPassword);

    if (!comparePassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = await createAccessToken({ email: userEmail });
    console.log("Generated Token:", token);

    res.cookie("token", token);
    res.json({ message: "User  logged in successfully.", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
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
