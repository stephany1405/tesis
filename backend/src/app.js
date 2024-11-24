import express from "express";
import morgan from "morgan";

const app = express();

import authRoutes from "./routes/auth.router.js";

app.use(morgan("dev"));

app.use("/api", authRoutes);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Hello !`);
});

export default app;
