import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  productivityAnalysis,
  focusSuggestions,
  weeklyReport,
  adaptiveTimer,
  burnoutCheck,
} from "../controllers/ai.controller.js";

const aiRouter = Router();

/**
 * @route   POST /api/ai/productivity-analysis
 * @desc    Analyze the user's productivity for the last 7 days using Gemini AI.
 *          Auto-pulls focus + task stats from DB — no body required.
 * @body    { period?: "this week" }   (optional label for the report)
 * @returns { analysis: { headline, score_interpretation, strengths, areas_to_improve,
 *             distraction_insight, streak_message, tomorrow_goal }, rawStats }
 * @access  Private
 */
aiRouter.post("/productivity-analysis", authenticateUser, productivityAnalysis);

/**
 * @route   POST /api/ai/focus-suggestions
 * @desc    Get personalized Pomodoro/focus session recommendations based on 30-day patterns.
 *          Auto-pulls session patterns, moods, and task backlog from DB.
 * @body    { tasksBacklog?: number }  (optional override)
 * @returns { suggestions: { optimal_session_length, optimal_break_length,
 *             best_time_to_focus, recommended_mode, tips[], distraction_strategy,
 *             mood_note, priority_suggestion } }
 * @access  Private
 */
aiRouter.post("/focus-suggestions", authenticateUser, focusSuggestions);

/**
 * @route   POST /api/ai/weekly-report
 * @desc    Generate a narrative weekly report with trend analysis and next-week plan.
 *          Auto-pulls last 7 heatmap days + badges + XP from DB.
 * @body    {}  (no body needed)
 * @returns { report: { title, summary, trend, highlights[], challenges[],
 *             next_week_plan, motivational_close }, period }
 * @access  Private
 */
aiRouter.post("/weekly-report", authenticateUser, weeklyReport);

/**
 * @route   GET /api/ai/adaptive-timer
 * @desc    Returns AI-suggested optimal focus duration based on user's 14-day session patterns.
 * @access  Private
 */
aiRouter.get("/adaptive-timer", authenticateUser, adaptiveTimer);

/**
 * @route   GET /api/ai/burnout-check
 * @desc    Detects burnout/overwork signals from last 7 days of activity.
 * @access  Private
 */
aiRouter.get("/burnout-check", authenticateUser, burnoutCheck);

export default aiRouter;
