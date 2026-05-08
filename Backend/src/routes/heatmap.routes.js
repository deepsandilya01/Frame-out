import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  syncHeatmap,
  getYearHeatmap,
  getRangeHeatmap,
  getTodayCell,
} from "../controllers/heatmap.controller.js";

const heatmapRouter = Router();

/**
 * @route   POST /api/heatmap/sync
 * @desc    Rebuild today's heatmap cell from raw focus + task data.
 *          Call this after ending a focus session or completing a task.
 * @access  Private
 */
heatmapRouter.post("/sync", authenticateUser, syncHeatmap);

/**
 * @route   GET /api/heatmap/year
 * @desc    Returns 365-day activity grid (GitHub-style, last 52 weeks).
 *          Each cell: { date, focusMinutes, sessionsCompleted, tasksCompleted, distractions, level (0-4) }
 *          Missing days are filled with level=0 so the frontend has no gaps.
 * @access  Private
 */
heatmapRouter.get("/year", authenticateUser, getYearHeatmap);

/**
 * @route   GET /api/heatmap/range?from=YYYY-MM-DD&to=YYYY-MM-DD
 * @desc    Returns heatmap data for a custom date range
 * @access  Private
 */
heatmapRouter.get("/range", authenticateUser, getRangeHeatmap);

/**
 * @route   GET /api/heatmap/today
 * @desc    Returns today's single heatmap cell
 * @access  Private
 */
heatmapRouter.get("/today", authenticateUser, getTodayCell);

export default heatmapRouter;
