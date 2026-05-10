import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  syncHeatmap,
  getYearHeatmap,
  getRangeHeatmap,
  getTodayCell,
  markActive,
} from "../controllers/heatmap.controller.js";

const heatmapRouter = Router();

// --- Write ---
heatmapRouter.post("/sync",   authenticateUser, syncHeatmap);
heatmapRouter.post("/active", authenticateUser, markActive);

// --- Read ---
heatmapRouter.get("/year",   authenticateUser, getYearHeatmap);
heatmapRouter.get("/range",  authenticateUser, getRangeHeatmap);
heatmapRouter.get("/today",  authenticateUser, getTodayCell);

export default heatmapRouter;
