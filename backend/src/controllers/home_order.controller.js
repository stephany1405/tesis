import { getAllCategory, getServices } from "../models/appointment.model.js";

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
    console.error("Error en getServicesByCategory:", error);
    next(error);
  }
};
