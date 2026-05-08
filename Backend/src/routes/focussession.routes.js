import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  startSession,
  endSession,
  getHistories,
  getStats,
  getTodaySessions,
  getWeekSessions,
  getMonthSessions,
  getCalendar,
} from "../controllers/focussession.controller.js";
import {
  validateStartSession,
  validateEndSession,
} from "../validator/focussession.validator.js";

const focusRouter = Router();

/**
 * @route   POST /api/focus/start
 * @desc    Start a focus session (pomodoro = 25min focus + 5min break | custom = user-defined)
 * @body    { timerType: "pomodoro"|"custom", focusDuration?, breakDuration?, mode?, mood? }
 * @access  Private
 */
focusRouter.post("/start", authenticateUser, validateStartSession, startSession);

/**
 * @route   POST /api/focus/end
 * @desc    End an active focus session and update user stats
 * @body    { sessionId, distractions?, notes?, mood?, completed? }
 * @access  Private
 */
focusRouter.post("/end", authenticateUser, validateEndSession, endSession);

/**
 * @route   GET /api/focus/histories?page=1&limit=10
 * @desc    Get paginated history of all focus sessions
 * @access  Private
 */
focusRouter.get("/histories", authenticateUser, getHistories);

/**
 * @route   GET /api/focus/stats
 * @desc    Get aggregated focus stats (totalTime, streak, rank, etc.)
 * @access  Private
 */
focusRouter.get("/stats", authenticateUser, getStats);

/**
 * @route   GET /api/focus/today
 * @desc    Get all focus sessions for today + total minutes
 * @access  Private
 */
focusRouter.get("/today", authenticateUser, getTodaySessions);

/**
 * @route   GET /api/focus/week
 * @desc    Get all focus sessions for the current week
 * @access  Private
 */
focusRouter.get("/week", authenticateUser, getWeekSessions);

/**
 * @route   GET /api/focus/month
 * @desc    Get all focus sessions for the current month
 * @access  Private
 */
focusRouter.get("/month", authenticateUser, getMonthSessions);

/**
 * @route   GET /api/focus/calendar
 * @desc    Get daily focus minutes grouped by date (current month)
 * @access  Private
 */
focusRouter.get("/calendar", authenticateUser, getCalendar);

export default focusRouter;