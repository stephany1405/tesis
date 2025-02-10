import { pool } from "../db.js";

const getRoleId = async () => {
  try {
    const query = {
      text: `SELECT id FROM public."classification" WHERE classification_type = $1`,
      values: ["cliente"],
    };

    const { rows } = await pool.query(query);

    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("Error al obtener el role_id:", err);
    throw err;
  }
};
const getRoleIdSpecialist = async () => {
  try {
    const query = {
      text: `SELECT id FROM public."classification" WHERE classification_type = $1`,
      values: ["especialista"],
    };

    const { rows } = await pool.query(query);

    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("Error al obtener el role_id:", err);
    throw err;
  }
};
const getRoleIdAdministrator = async () => {
  try {
    const query = {
      text: `SELECT id FROM public."classification" WHERE classification_type = $1`,
      values: ["administrador"],
    };

    const { rows } = await pool.query(query);

    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("Error al obtener el role_id:", err);
    throw err;
  }
};

const getUser = async (email) => {
  try {
    const query = {
      text: `SELECT email, password, role_id, id, status FROM public.user WHERE email = $1 LIMIT 1`,
      values: [email],
    };
    const { rows } = await pool.query(query);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("Error al obtener el usuario: ", err);
    throw new Error("Error al obtener el usuario");
  }
};

export { getRoleId, getUser, getRoleIdAdministrator, getRoleIdSpecialist };
