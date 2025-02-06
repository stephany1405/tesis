export const PORT = process.env.PORT || 3000;
export const DB_USER = process.env.DB_USER;
export const DB_HOST = process.env.DB_HOST;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;

export const SECRET_PASSWORD_JWT = process.env.SECRET_PASSWORD;

export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;

// --------------------------------------------------------------------------------------

import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
  timeout: 10000,
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("Error de configuración:", error);
  } else {
    console.log("Servidor listo para enviar emails");
  }
});
