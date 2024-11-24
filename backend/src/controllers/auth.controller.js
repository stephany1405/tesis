import { pool } from "../db.js";
import bcrypt from "bcryptjs"

const register = async (req, res) => {
  try {
    const client = await pool.connect();

    //tomando ID de Role-> default (usuario)
    const getDefaultRoleID = await client.query('SELECT id FROM public."classification" WHERE classification_type = \'usuario\'');
    client.release();
    const RoleID = getDefaultRoleID.rows[0].id; 


    const {name, lastname, identification, email, password, date_of_birth } = req.body;

    if (!name || !lastname || !identification || !email ||!password || !date_of_birth ) return res.json({ message: "required fields" });

    if (email)
      return res.status(400).json({ message: ["The Email already exists"] });

    if (identification)
      return res.status(400).json({mensagge: ["The identification already exists"]})

    const hashPassword = await bcrypt.hash(password, 10)



    const createUser = await client.query('INSERT INTO user (name, lastname, identification, email, password, role_id, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, lastname, identification, email, hashPassword, RoleID ,date_of_birth]);



  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
 
export { register };
