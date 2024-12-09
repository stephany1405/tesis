import { check } from "express-validator";
import validateResult from "../middlewares/validate.middleware.js";
import { pool } from "../db.js";

const validateCreate = [
  check("name")
    .exists()
    .withMessage("El campo nombre es requerido.")
    .notEmpty()
    .withMessage("El campo nombre no puede estar vacio.")
    .trim(),
  check("lastname")
    .exists()
    .withMessage("El campo apellido es requerido")
    .notEmpty()
    .withMessage("El campo apellido no puede estar vacio")
    .trim(),
  check("identification")
    .exists()
    .withMessage("El campo identificación es requerido")
    .notEmpty()
    .withMessage("El campo identificación no puede estar vacio")
    .trim()
    .custom(async (value) => {
      const client = await pool.connect();
      const { rows: identificationExists } = await client.query(
        'SELECT id FROM public."user" WHERE identification = $1',
        [value]
      );
      if (identificationExists.length > 0) {
        throw new Error("La identificación ya existe");
      }
      client.release();
    }),
  check("email")
    .exists()
    .withMessage("El campo correo es requerido")
    .notEmpty()
    .withMessage("El campo correo no puede estar vacio")
    .isEmail()
    .withMessage("El campo correo debe ser un correo electronico")
    .trim()
    .custom(async (value) => {
      const client = await pool.connect();
      const { rows: emailExists } = await client.query(
        'SELECT id FROM public."user" WHERE email = $1',
        [value]
      );
      if (emailExists.length > 0) {
        throw new Error("El correo electronico ya existe.");
      }
      client.release();
    }),
  check("telephone_number")
    .exists()
    .withMessage("El campo número telefónico es requerido.")
    .notEmpty()
    .withMessage("El campo número telefónico no puede estar vacio.")
    .trim(),
  check("password")
    .exists()
    .withMessage("El campo contraseña es requerido.")
    .notEmpty()
    .withMessage("El campo contraseña no puede estar vacio.")
    .trim(),
  check("date_of_birth")
    .exists()
    .withMessage("El campo fecha de nacimiento es requerido.")
    .notEmpty()
    .withMessage("El campo fecha de nacimiento no puede estar vacio.")
    .trim(),
  validateResult,
];

const validateLogin = [
  check("email")
    .exists()
    .withMessage("El campo correo es requerido")
    .notEmpty()
    .withMessage("El campo correo no puede estar vacio")
    .isEmail()
    .withMessage("El campo correo debe ser un correo electronico")
    .trim(),
  check("password")
    .exists()
    .withMessage("El campo contraseña es requerido.")
    .notEmpty()
    .withMessage("El campo contraseña no puede estar vacio.")
    .trim()
];

export { validateCreate, validateLogin };
