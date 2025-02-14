import pg from "pg";
import {
  DB_USER,
  DB_HOST,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
} from "./config.js";
//local -> 
// export const pool = new pg.Pool({
//   user: DB_USER,
//   host: DB_HOST,
//   password: DB_PASSWORD,
//   database: DB_DATABASE,
//   port: DB_PORT,
//   ssl: false,
// });

//Render ->
export const pool = new pg.Pool({
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("Conexión exitosa.");
    console.log(result.rows[0].now);
  })
  .catch((err) => {
    console.error("Error conectando la base de datos.", err);
  });
