import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createAccessToken } from "../libs/jwt.lib.js";
import { getRoleId, getUser } from "../models/user.model.js";
import { transporter } from "../config.js";
export const register = async (req, res) => {
  const client = await pool.connect();
  try {
    const role = await getRoleId();

    if (!role) {
      return res.status(400).json({ message: "Rol de cliente no encontrado." });
    }

    const RoleID = role.id;

    const {
      name,
      lastname,
      identification,
      gender,
      email,
      telephone_number,
      password,
      date_of_birth,
      security_question,
      security_answer,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const tableName = "user";
    const schemaName = "public";

    const { rows: columns } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = $2",
      [tableName, schemaName]
    );

    const columnNames = columns.map((col) => col.column_name);

    const data = {
      name,
      lastname,
      identification,
      gender,
      email,
      telephone_number,
      password: hashedPassword,
      role_id: RoleID,
      date_of_birth,
      security_question,
      security_answer,
      picture_profile: "/uploads/profile-pics/user.webp",
    };

    const filteredColumns = columnNames.filter(
      (col) => data[col] !== undefined
    );
    const filteredValues = filteredColumns.map((col) => data[col]);

    const placeholders = filteredColumns
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const query = `INSERT INTO public."${tableName}" (${filteredColumns.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;

    const { rows: createdUser } = await client.query(query, filteredValues);

    const token = await createAccessToken({
      email: createdUser[0].email,
      role_id: createdUser[0].role_id,
    });
    res.cookie("token", token, {
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser[0];
    res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: userWithoutPassword,
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  } finally {
    if (client) client.release();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await getUser(email);

    if (!userData) {
      return res
        .status(400)
        .json({ message: "Correo o contraseña incorrecta" });
    }

    const {
      email: userEmail,
      password: userPassword,
      role_id: userRole,
      id: userId,
      status,
    } = userData;
    const passwordIsValid = await bcrypt.compare(password, userPassword);

    if (!passwordIsValid) {
      return res
        .status(400)
        .json({ message: "Correo o contraseña incorrecta" });
    }

    if (!status) {
      return res.status(403).json({
        message: "Tu cuenta está bloqueada. Contacta al administrador.",
      });
    }

    const token = await createAccessToken({
      email: userEmail,
      role_id: userRole,
      id: userId,
    });

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res
      .status(200)
      .json({ message: "Inicio de sesión exitoso", token, role: userRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query(
      "SELECT name, lastname FROM PUBLIC.USER WHERE EMAIL = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res
        .status(200)
        .json({ valid: false, message: "Usuario no encontrado" });
    }
    const { name, lastname } = user.rows[0];

    const code = crypto.randomBytes(3).toString("hex");

    await pool.query(
      "UPDATE public.user SET reset_code = $1 WHERE email = $2",
      [code, email]
    );

    const mailOptions = {
      from: '"Equipo de Soporte de UÑIMAS" <unimas304@gmail.com',
      to: email,
      subject: "UÑIMAS - Código de recuperación de contraseña 👨‍💻",
      text: `Hola! ${name} ${lastname} hemos recibido la notificación de que intentas recuperar tu contraseña, el código es el siguiente. ¡Recuerda no compartirlo con nadie!: ${code}`,
    };

    try {
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });

      return res.status(200).json({
        valid: true,
        message: "Código enviado al correo",
      });
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).json({
        message: "Error al enviar el correo",
        error: error.message || "Error desconocido",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ text: "Error en el servidor", message: error.message });
  }
};

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const query = await pool.query(
      "SELECT reset_code, email FROM public.user WHERE email = $1 and reset_code = $2",
      [email, code]
    );
    if (query.rowCount === 0) {
      return res
        .status(200)
        .json({ valid: false, message: "Código incorrecto" });
    } else {
      return res.status(200).json({ valid: true, message: "Código correcto" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error });
  }
};

export const changePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = await pool.query(
      "UPDATE PUBLIC.USER SET PASSWORD = $1 WHERE email = $2",
      [hashedPassword, email]
    );
    await pool.query(
      "UPDATE PUBLIC.USER SET reset_code = null WHERE email = $1 ",
      [email]
    );
    if (query.rowCount === 1) {
      return res.status(200).json({
        valid: true,
        message: "Se ha cambiado la contraseña exitosamente.",
      });
    } else {
      return res
        .status(404)
        .json({ valid: false, message: "No se pudo cambiar la contraseña." });
    }
  } catch (error) {
    res.status(500).json({ Message: "Error interno en el servidor.", error });
  }
};

export const getSecurityQuestion = async (req, res) => {
  const { email } = req.body;

  try {
    const query = await pool.query(
      "SELECT security_question FROM public.user WHERE email = $1",
      [email]
    );

    if (query.rowCount === 0) {
      return res
        .status(200)
        .json({ valid: false, message: "Usuario no encontrado" });
    } else {
      return res.status(200).json({
        valid: true,
        security_question: query.rows[0].security_question,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "error interno en el servidor", error: error });
  }
};

export const verifyAnswer = async (req, res) => {
  const { email, securityAnswer } = req.body;
  try {
    const query = await pool.query(
      "SELECT id FROM PUBLIC.USER WHERE email = $1 and answer = $2",
      [email, securityAnswer]
    );

    if (query.rowCount === 1) {
      return res
        .status(200)
        .json({ valid: true, message: "Respuesta Correcta." });
    } else {
      return res
        .status(200)
        .json({ valid: false, message: "Respuesta Incorrecta." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error interno en el servidor.", error: error });
  }
};
