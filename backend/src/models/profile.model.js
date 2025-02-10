import { pool } from "../db.js";

export const getProfile = async (userID) => {
  try {
    const query = {
      text: `SELECT picture_profile, name, lastname, identification, email, telephone_number, security_question, answer FROM PUBLIC.USER WHERE ID = $1`,
      values: [userID],
    };
    const { rows } = await pool.query(query);
    return rows.length > 0 ? rows : null;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
};