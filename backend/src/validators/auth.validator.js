import { check } from "express-validator";
import validateResult from "../middlewares/validate.middleware.js";
import { pool } from "../db.js";

const client = await pool.connect();

const validateCreate = [
  check("name").exists().notEmpty().trim(),
  check("lastname").exists().notEmpty().trim(),
  check("identification")
    .exists()
    .notEmpty()
    .trim()
    .custom(async (value) => {
      const { rows: identificationExists } = await client.query(
        'SELECT id FROM public."user" WHERE identification = $1',
        [value]
      );
      if (identificationExists.length > 0) {
        throw new Error("The identification already exists");
      }
    }),
  check("email")
    .exists()
    .notEmpty()
    .isEmail()
    .trim()
    .custom(async (value) => {
      const { rows: emailExists } = await client.query(
        'SELECT id FROM public."user" WHERE email = $1',
        [value]
      );
      if (emailExists.length > 0) {
        throw new Error("The email already exists");
      }
    }),
  check("telephone_number").exists().notEmpty().trim(),
  check("password").exists().notEmpty().trim(),
  check("date_of_birth").exists().notEmpty().trim(),
  validateResult, // Aquí se puede pasar directamente la función
];

export default validateCreate;
