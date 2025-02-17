import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.router.js";
import appointmentRoutes from "./routes/appointment.router.js";
import orderRouter from "./routes/order.router.js";
import dolarBCV from "./routes/bcv.router.js";
import rolesRouter from "./routes/roles.router.js";
import profileRouter from "./routes/profile.router.js";
import geoRouter from "./routes/geocode.router.js";
import userRouter from "./routes/users.router.js";
import statisticRouter from "./routes/statistics.router.js";
import backupRouter from "./routes/backup.router.js";
import iaRouter from "./routes/ia.router.js";
import { errorHandler } from "./middlewares/catch.middleware.js";

const app = express();

const __dirname = path.dirname("uploads");

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "http://localhost:3000"],
      },
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

app.use(morgan("dev"));

app.use((req, res, next) => {
  req.wss = app.locals.wss;
  next();
});
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use("/api/usuario", authRoutes);
app.use("/api/servicios", appointmentRoutes);
app.use("/api/orden", orderRouter);
app.use("/api", dolarBCV);
app.use("/api", rolesRouter);
app.use("/api", profileRouter);
app.use("/api", geoRouter);
app.use("/api", userRouter);
app.use("/api", statisticRouter);
app.use("/api", backupRouter);
app.use("/api", iaRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send(`Hello !`);
});

export default app;
