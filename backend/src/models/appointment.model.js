import { pool } from "../db.js";

export const getAllCategory = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `SELECT id,classification_type, description, service_image FROM classification WHERE service_category = TRUE`,
    };
    const { rows } = await client.query(query);
    return rows.length > 0 ? rows : null;
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  } finally {
    client.release();
  }
};

export const getServices = async (categoryID) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `SELECT id, classification_type, description, service_image, price, time FROM classification WHERE parent_classification_id = $1`,
      values: [categoryID],
    };

    const { rows } = await client.query(query);
    return rows;
  } catch (error) {
    console.error("Error al obtener los servicios por categoría:", error);
    throw error;
  } finally {
    client.release();
  }
};
