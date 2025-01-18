import jwt from "jsonwebtoken";
import { SECRET_PASSWORD_JWT } from "../config.js";


export const authRequiredWithRole = (requiredRole) => (req, res, next) => {
  let { token } = req.cookies;
  console.log(token)
  if (!token) return res.status(401).json({ message: "No autorizado" });

  token = token.split(" ")[1];

  try {
    const { email, role_id } = jwt.verify(token, SECRET_PASSWORD_JWT);
    req.email = email;
    req.role_id = role_id;

    if (requiredRole && role_id !== requiredRole) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Token Inválido" });
  }
};
