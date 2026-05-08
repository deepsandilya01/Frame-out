import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import authRouter from "./routes/auth.routes.js";
import taskRouter from "./routes/task.routes.js";
import focusRouter from "./routes/focussession.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import heatmapRouter from "./routes/heatmap.routes.js";
import statsRouter from "./routes/userstats.routes.js";
import aiRouter from "./routes/ai.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

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

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/focus", focusRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/heatmap", heatmapRouter);
app.use("/api/userstats", statsRouter);
app.use("/api/ai", aiRouter);

export default app;
