import { pool } from "../db.js";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
  try {

    
    const client = await pool.connect();

    const { rows: roleRows } = await client.query(
      'SELECT id FROM public."classification" WHERE classification_type = $1',
      ["usuario"]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ message: "Default role not found" });
    }
    const RoleID = roleRows[0].id;

    const { name, lastname, identification, email, telephone_number, password, date_of_birth } =
      req.body;

    if (
      !name ||
      !lastname ||
      !identification ||
      !email ||
      !telephone_number ||
      !password ||
      !date_of_birth
    )
      return res.json({ message: "required fields" });

    const { rows: emailExists } = await client.query(
      'SELECT id FROM public."user" WHERE email = $1',
      [email]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ message: "The email already exists" });
    }

    const { rows: identificationExists } = await client.query(
      'SELECT id FROM public."user" WHERE identification = $1',
      [identification]
    );
    if (identificationExists.length > 0) {
      return res
        .status(400)
        .json({ message: "The identification already exists" });
    }

    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password, salt);


    const { rows: createdUser } = await client.query(
      'INSERT INTO public."user" (name, lastname, identification, email, telephone_number, password, role_id, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        name,
        lastname,
        identification,
        email,
        telephone_number,
        hashedPassword,
        RoleID,
        date_of_birth,
      ]
    );

    // Responder con el usuario creado (sin la contraseña por seguridad)
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json(userWithoutPassword);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

export { register };
