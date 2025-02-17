import { pool } from "../db.js";

export const getAllCategory = async (req, res, next) => {
  try {
    const query = {
      text: `SELECT id,classification_type, description, service_image FROM classification WHERE service_category = TRUE`,
    };
    const { rows } = await pool.query(query);
    return rows.length > 0 ? rows : null;
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

export const getServices = async (categoryID) => {
  try {
    const query = {
      text: `SELECT id, classification_type,parent_classification_id, description, service_image, price, time FROM classification WHERE parent_classification_id = $1 AND is_active = true`,
      values: [categoryID],
    };

    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error al obtener los servicios por categoría:", error);
    throw error;
  }
};
