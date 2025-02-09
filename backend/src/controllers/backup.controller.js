import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../config.js";
import { fileURLToPath } from "url";
import multer from "multer";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, "../backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const backupDir = path.join(__dirname, "../backups");
    cb(null, backupDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

export const backupDatabase = (req, res) => {
  const backupFile = path.join(backupDir, `backup_${Date.now()}.sql`);
  const pgDumpPath = '"C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump"';

  const dumpCommand = `${pgDumpPath} -U ${DB_USER} -h ${DB_HOST} ${DB_DATABASE} > ${backupFile}`;

  exec(
    dumpCommand,
    {
      env: {
        ...process.env,
        PGPASSWORD: DB_PASSWORD,
      },
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al realizar el backup: ${error.message}`);
        return res.status(500).json({
          error: "Error al realizar el backup",
          details: error.message,
        });
      }
      console.log(`Backup realizado exitosamente. Archivo: ${backupFile}`);
      return res
        .status(200)
        .json({ message: "Backup realizado exitosamente", backupFile });
    }
  );
};

export const restoreDatabase = [
  upload.single("backup"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionó archivo de backup" });
    }

    const backupFile = req.file.path;
    const psqlPath = '"C:\\Program Files\\PostgreSQL\\17\\bin\\psql"';
    const restoreCommand = `${psqlPath} -U ${DB_USER} -h ${DB_HOST} -d ${DB_DATABASE} -f "${backupFile}"`;

    exec(
      restoreCommand,
      {
        env: {
          ...process.env,
          PGPASSWORD: DB_PASSWORD,
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al restaurar el backup: ${error.message}`);
          return res.status(500).json({
            error: "Error al restaurar el backup",
            details: error.message,
          });
        }
        console.log(
          `Backup restaurado exitosamente desde el archivo: ${backupFile}`
        );
        return res
          .status(200)
          .json({ message: "Backup restaurado exitosamente" });
      }
    );
  },
];

export const createSecretPassword = async (req, res) => {
  try {
    const { secretPassword, userID } = req.body;
    if (!secretPassword || !userID) {
      return res.status(400).json({ message: "Data Requerida." });
    }

    const hashedSecretPassword = await bcrypt.hash(secretPassword, 10);

    const query = {
      text: `UPDATE public.user SET secret_password = $1 WHERE id = $2`,
      values: [hashedSecretPassword, userID],
    };

    await pool.query(query);
    res.status(200).json({ message: "Contraseña Secreta Creada." });
  } catch (error) {
    console.error("Error creating secret password:", error);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
};

export const compareSecretPassword = async (req, res) => {
  try {
    const { userID, secretPassword } = req.body;
    console.log(secretPassword);
    if (!secretPassword || !userID) {
      return res.status(401).json({ message: "Data Requerida." });
    }

    const { rows } = await pool.query(
      `SELECT secret_password FROM PUBLIC.USER WHERE id = ${userID}`
    );
    const secretHashed = rows[0].secret_password;
    const compareSecrets = await bcrypt.compare(secretPassword, secretHashed);
    if (compareSecrets) {
      return res.status(200).json({ message: "Contraseña Secreta Correcta." });
    } else {
      return res
        .status(401)
        .json({ message: "Contraseña Secreta Incorrecta." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "error interno en el servidor", error: error });
  }
};
