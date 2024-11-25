import jwt from "jsonwebtoken";
import { SECRET_PASSWORD_JWT } from "../config.js";

export const authRequired = (req, res, next) => {
  let { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  token = token.split(" ")[1];
  
  jwt.verify(token, SECRET_PASSWORD_JWT, (err, user) => {
    if (err) return res.status(401).json({ message: "invalid token" });

    req.user = user;
    next();
  });
};
