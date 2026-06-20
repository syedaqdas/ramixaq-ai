import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import achievementRoutes from "./routes/achievementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Ramixaq AI API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
