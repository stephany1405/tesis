import jwt from "jsonwebtoken";
import { SECRET_PASSWORD_JWT } from "../config.js";
export const authRequired = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  jwt.verify(token, SECRET_PASSWORD_JWT, (err, user) => {
    if (err) return res.status(401).json({ message: "invalid token" });

    req.user = user;
    next();
  });
};
