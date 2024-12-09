import { pool } from "../db.js";

const getRoleId = async () => {
  const client = await pool.connect();

  try {
    const query = {
      text: `SELECT id FROM public."classification" WHERE classification_type = $1`,
      values: ["cliente"],
    };

    const { rows } = await client.query(query);

    if (rows.length === 0) return null;

    return rows[0];
  } catch (err) {
    console.error("Error al obtener el role_id:", err);
    throw err;
  } finally {
    client.release();
  }
};

const getUser = async (email) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `SELECT email, password, role_id FROM public.user WHERE email = $1 LIMIT 1`,
      values: [email],
    };
    const { rows } = await client.query(query);
    if(rows.length === 0) return null;
    return rows[0]
  } catch (err) {
    console.error("Error al obtener el usuario: ", err);
    throw new Error("Error al obtener el usuario");
  } finally {
    client.release();
  }
};
export { getRoleId, getUser };
