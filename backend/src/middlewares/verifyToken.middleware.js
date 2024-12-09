import jwt from "jsonwebtoken";
import { SECRET_PASSWORD_JWT } from "../config.js";

export const authRequired = (req, res, next) => {
  let { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "No autorizado" });

  token = token.split(" ")[1];

  try {
    const { email, role_id } = jwt.verify(token, SECRET_PASSWORD_JWT);
    (req.email = email), (req.role_id = role_id);
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).status({ error: "Token Invalido" });
  }
};

export const authAdmin = (req, res, next) => {
  if (req.role_id === 55)
    return res.status(200).json({ message: "Admin autorizado" }, next());

  return res
    .status(403)
    .status(403)
    .json({ message: "Token no autorizado, solo usuario administrador" });
};

export const authClient = (req, res, next) => {
  if (req.role_id === 53 || req.role_id === 55)
    return res.status(200).json({ message: "Cliente autorizado" }, next());

  return res
    .status(403)
    .status(403)
    .json({ message: "Token no autorizado, solo usuario cliente" });
};

export const authSpecialist = (req, res, next) => {
  if (req.role_id === 54 || req.role_id === 55)
    return res.status(200).json({ message: "Especialista autorizado" }, next());

  return res
    .status(403)
    .status(403)
    .json({ message: "Token no autorizado, solo usuario especialista" });
};
