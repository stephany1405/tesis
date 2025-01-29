import { getProfile } from "../models/profile.model.js";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

export const getProfileController = async (req, res, next) => {
  const { userID } = req.params;
  try {
    const profile = await getProfile(userID);
    if (profile) {
      return res.status(200).json(profile[0]);
    }
    res.status(404).json({ message: "Usuario no encontrado" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    const { userId } = req.body;
    const imageUrl = `/uploads/profile-pics/${req.file.filename}`;

    const query = {
      text: "UPDATE PUBLIC.USER SET picture_profile = $1 WHERE id = $2 RETURNING picture_profile",
      values: [imageUrl, userId],
    };

    const result = await pool.query(query);

    res.json({
      message: "Imagen subida exitosamente",
      imageUrl: result.rows[0].picture_profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al subir la imagen" });
  }
};

export const uploadUserData = async (req, res) => {
  try {
    const { userID } = req.params;
    const { telephone_number } = req.body;

    const query = {
      text: "UPDATE public.user SET telephone_number = $1 WHERE id = $2 RETURNING *",
      values: [telephone_number, userID],
    };

    const result = await pool.query(query);

    if (result.rowCount === 1) {
      res.status(200).json({ message: "Perfil actualizado correctamente." });
    } else {
      res.status(500).json({ message: "Error al actualizar el perfil." });
    }
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userID } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const query = "SELECT PASSWORD FROM PUBLIC.USER WHERE ID = $1";
    const result = await pool.query(query, [userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const hashedPassword = result.rows[0].password;
    const passwordMatch = await bcrypt.compare(currentPassword, hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    const updateQuery = "UPDATE public.user SET password = $1 WHERE id = $2";
    await pool.query(updateQuery, [hashedNewPassword, userID]);

    return res
      .status(200)
      .json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const uploadSecurityQuestions = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userID } = req.params;
    const { securityQuestion, securityAnswer } = req.body;

    if (!securityQuestion || !securityAnswer) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    const query = {
      text: `UPDATE PUBLIC.USER SET security_question = $1, answer = $2 WHERE ID = $3`,
      values: [securityQuestion, securityAnswer, userID],
    };

    const result = await client.query(query);

    if (result.rowCount === 1) {
      return res
        .status(200)
        .json({ message: "Preguntas de seguridad actualizado correctamente." });
    } else {
      return res
        .status(500)
        .json({ message: "Error al actualizar preguntas de seguridad." });
    }
  } catch (error) {
    console.error("Error al actualizar las preguntas de seguridad:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  } finally {
    client.release();
  }
};

