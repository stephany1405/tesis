import { SECRET_PASSWORD_JWT } from "../config.js";
import jwt from 'jsonwebtoken';


export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        SECRET_PASSWORD_JWT,
        { expiresIn: "1d" },
        (err, token) => {
          if(err) reject (err);
          resolve(token);
        }
      );
    });
  }