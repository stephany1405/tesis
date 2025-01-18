import {
  getRoleId,
  getRoleIdAdministrator,
  getRoleIdSpecialist,
} from "../models/user.model.js";

export const getRoleClientC = async (req, res) => {
  try {
    const roleClient = await getRoleId();
    res.status(200).json(roleClient);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};

export const getRoleAdministratorC = async (req, res) => {
  try {
    const roleAdministrator = await getRoleIdAdministrator();
    res.status(200).json(roleAdministrator);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};
export const getRoleSpecialistC = async (req, res) => {
  try {
    const roleSpecialist = await getRoleIdSpecialist();
    res.status(200).json(roleSpecialist);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};
