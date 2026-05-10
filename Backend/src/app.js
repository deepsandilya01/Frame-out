import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";

// Routes
import authRouter from "./routes/auth.routes.js";
import taskRouter from "./routes/task.routes.js";
import focusRouter from "./routes/focussession.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import heatmapRouter from "./routes/heatmap.routes.js";
import statsRouter from "./routes/userstats.routes.js";
import aiRouter from "./routes/ai.routes.js";
import journalRouter from "./routes/journal.routes.js";
import missionRouter from "./routes/mission.routes.js";

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(helmet()); // Security headers
// app.use(mongoSanitize()); // Incompatible with Express 5 on some Node versions

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later", success: false },
});
app.use("/api", limiter);

app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174",
      config.FRONTEND_URL // Allow production URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// 2. AUTH CONFIG
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    },
  ),
);

// 3. ROUTES
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Frame-Out API is running", version: "1.0.0" });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/focus", focusRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/heatmap", heatmapRouter);
app.use("/api/userstats", statsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/journal", journalRouter);
app.use("/api/missions", missionRouter);

// 4. ERROR HANDLING
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found`, success: false });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    success: false,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

export default app;
