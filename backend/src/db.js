import pg from "pg";
import {
  DB_USER,
  DB_HOST,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
} from "./config.js";

export const pool = new pg.Pool({
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
});

pool.query("SELECT NOW()")
  .then((result) => {
    console.log("Connection successful!");
    console.log(result.rows[0].now);
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });
