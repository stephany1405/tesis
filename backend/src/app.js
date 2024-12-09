import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/auth.router.js";
import appointmentRoutes from "./routes/appointment.router.js";

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(morgan("dev"));

app.use("/api", authRoutes);
app.use("/api", appointmentRoutes)

app.get("/", (req, res) => {
  res.send(`Hello !`);
});

export default app;
