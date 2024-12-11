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

const authorizedRoles = {
  admin: new Set([55]),
  client: new Set([53, 55]),
  specialist: new Set([54, 55]),
};

export const authMiddleware = (role) => {
  return (req, res, next) => {
    if (authorizedRoles[role].has(req.role_id)) {
      next();
    } else {
      res.status(403).json({ message: `No autorizado: Solo se permite ${role}` });
    }
  };
};

export const authAdmin = authMiddleware('admin');
export const authClient = authMiddleware('client');
export const authSpecialist = authMiddleware('specialist');