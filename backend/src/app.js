import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.router.js";
import appointmentRoutes from "./routes/appointment.router.js";
import orderRouter from "./routes/order.router.js";
import dolarBCV from "./routes/bcv.router.js"
import rolesRouter from "./routes/roles.router.js";

import { errorHandler } from "./middlewares/catch.middleware.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

app.use(morgan("dev"));

app.use("/api/usuario", authRoutes);
app.use("/api/servicios", appointmentRoutes);
app.use("/api/orden", orderRouter);
app.use("/api", dolarBCV)
app.use("/api", rolesRouter)
app.get("/", (req, res) => {
  res.send(`Hello !`);
});

export default app;
