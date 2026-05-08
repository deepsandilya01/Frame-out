import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  awardSessionXP,
  awardTaskXP,
  awardPerfectDay,
  getMyStats,
  getXPLog,
  getLeaderboard,
  getAllBadges,
  getLevelMap,
} from "../controllers/userstats.controller.js";

const statsRouter = Router();

// ---- Award XP ----

/**
 * @route   POST /api/userstats/award-session
 * @desc    Award XP after completing a focus session
 * @body    { distractions?, timerType?, startHour? }
 * @access  Private
 */
statsRouter.post("/award-session", authenticateUser, awardSessionXP);

/**
 * @route   POST /api/userstats/award-task
 * @desc    Award XP after completing a task
 * @body    { focusMinutesAdded? }
 * @access  Private
 */
statsRouter.post("/award-task", authenticateUser, awardTaskXP);

/**
 * @route   POST /api/userstats/perfect-day
 * @desc    Award bonus XP for a perfect day (4+ sessions + 3+ tasks)
 * @access  Private
 */
statsRouter.post("/perfect-day", authenticateUser, awardPerfectDay);

// ---- Read ----

/**
 * @route   GET /api/userstats/me
 * @desc    Get the logged-in user's full stats
 * @access  Private
 */
statsRouter.get("/me", authenticateUser, getMyStats);

/**
 * @route   GET /api/userstats/xp-log
 * @desc    Get the last 100 XP events (audit trail)
 * @access  Private
 */
statsRouter.get("/xp-log", authenticateUser, getXPLog);

/**
 * @route   GET /api/userstats/badges
 * @desc    Get all badge definitions with earned/locked status
 * @access  Private
 */
statsRouter.get("/badges", authenticateUser, getAllBadges);

/**
 * @route   GET /api/userstats/leaderboard
 * @desc    Get top 10 users by XP (public — name, level, xp only)
 * @access  Private
 */
statsRouter.get("/leaderboard", authenticateUser, getLeaderboard);

/**
 * @route   GET /api/userstats/level-map
 * @desc    Get XP thresholds for all levels (for progress bars)
 * @access  Private
 */
statsRouter.get("/level-map", authenticateUser, getLevelMap);

export default statsRouter;
