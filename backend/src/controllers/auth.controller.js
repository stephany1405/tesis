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
    const { rows: roleRows } = await client.query(
      'SELECT id FROM public."classification" WHERE classification_type = $1',
      ["usuario"]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ message: "Default role not found" });
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

    const token = await createAccessToken({ email: createdUser.email });
    res.cookie("token", token);

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "user created successfully",
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
