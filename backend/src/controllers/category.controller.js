import { text } from "express";
import { getAllCategory, getServices } from "../models/appointment.model.js";
import { pool } from "../db.js";

export const getCategory = async (req, res, next) => {
  try {
    const categories = await getAllCategory();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getServicesByCategory = async (req, res, next) => {
  try {
    const rows = await getServices(req.params.categoryID);
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron servicios para esta categoría." });
    }
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageUrl = `/uploads/categories/${req.file.filename}`;
    if (!req.file) {
      return res.status(400).json({ message: "La imagen es requerida." });
    }
    const query = {
      text: `INSERT INTO classification (classification_type, description, service_image, service_category)
             VALUES ($1, $2, $3, $4) RETURNING *`,
      values: [name, description, imageUrl, true],
    };

    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear categoría" });
  }
};

export const createServiceOfCategory = async (req, res, next) => {
  try {
    const { id, name, description, price, duration } = req.body;
    const imageUrl = `/uploads/services/${req.file.filename}`;
    if (!req.file) {
      return res.status(400).json({ message: "La imagen es requerida." });
    }
    const query = {
      text: `INSERT INTO public.classification (classification_type, parent_classification_id, service_image, description, price, time) values ($1,$2,$3,$4,$5,$6)`,
      values: [name, id, imageUrl, description, price, duration],
    };
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteServiceOfCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = {
      text: `UPDATE public.classification SET service_category = false WHERE id = $1`,
      values: [id],
    };
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateServiceOfCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "classification_type es obligatorio" });
    }

    const existingServiceQuery = {
      text: "SELECT service_image FROM public.classification WHERE id = $1",
      values: [id],
    };
    const existingServiceResult = await pool.query(existingServiceQuery);
    const existingService = existingServiceResult.rows[0];

    let service_image;
    if (req.file) {
      service_image = `/uploads/services/${req.file.filename}`;
    } else {
      service_image = existingService.service_image;
    }

    const query = {
      text: `
        UPDATE public.classification 
        SET classification_type = $1, description = $2, service_image = $3, price = $4, time = $5
        WHERE id = $6
        RETURNING *
      `,
      values: [name, description, service_image, price, duration, id],
    };

    const result = await pool.query(query);

    console.log("Resultado de la actualización:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
