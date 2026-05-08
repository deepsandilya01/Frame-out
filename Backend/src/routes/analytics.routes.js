import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  syncTodayAnalytics,
  getTodayAnalytics,
  getWeekAnalytics,
  getMonthAnalytics,
  getOverview,
} from "../controllers/analytics.controller.js";

const analyticsRouter = Router();

/**
 * @route   POST /api/analytics/sync
 * @desc    Rebuild today's analytics snapshot from raw focus + task data.
 *          Call this after ending a focus session or completing a task.
 * @access  Private
 */
analyticsRouter.post("/sync", authenticateUser, syncTodayAnalytics);

/**
 * @route   GET /api/analytics/today
 * @desc    Get today's analytics snapshot
 * @access  Private
 */
analyticsRouter.get("/today", authenticateUser, getTodayAnalytics);

/**
 * @route   GET /api/analytics/week
 * @desc    Get last 7 days of daily analytics (for charts)
 * @access  Private
 */
analyticsRouter.get("/week", authenticateUser, getWeekAnalytics);

/**
 * @route   GET /api/analytics/month
 * @desc    Get current month's daily analytics (for heatmap/calendar)
 * @access  Private
 */
analyticsRouter.get("/month", authenticateUser, getMonthAnalytics);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get all-time stats (totalFocusTime, streak, rank, best day, etc.)
 * @access  Private
 */
analyticsRouter.get("/overview", authenticateUser, getOverview);

export default analyticsRouter;
