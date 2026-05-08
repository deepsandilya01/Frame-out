import {
  analyzeProductivity,
  getFocusSuggestions,
  generateWeeklyReport,
  getAdaptiveTimer,
  detectBurnout,
} from "../services/ai.service.js";
import focusSessionModel from "../models/focussession.model.js";
import taskModel from "../models/task.model.js";
import analyticsModel from "../models/analytics.model.js";
import UserStatsModel from "../models/userstats.model.js";
import HeatmapModel from "../models/heatmap.model.js";
import { config } from "../config/config.js";

// Guard: check API key before any AI call
function checkApiKey(res) {
  if (!config.MISTRAL_API_KEY) {
    res.status(503).json({
      message: "AI service unavailable: MISTRAL_API_KEY is not configured",
      success: false,
    });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// POST /api/ai/productivity-analysis
// Pulls the user's stats for the last 7 days and sends to Gemini for analysis.
// Body (optional): { period: "this week" }
// ---------------------------------------------------------------------------
export const productivityAnalysis = async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const userId = req.user._id;
    const { period = "this week" } = req.body || {};

    // Gather last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [focusAgg] = await focusSessionModel.aggregate([
      { $match: { user: userId, startedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          totalFocusMinutes: { $sum: "$duration" },
          totalSessions:     { $sum: 1 },
          completedSessions: { $sum: { $cond: ["$completed", 1, 0] } },
          distractionsCount: { $sum: "$distractions" },
        },
      },
    ]);

    const [taskAgg] = await taskModel.aggregate([
      { $match: { user: userId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          tasksCreated:   { $sum: 1 },
          tasksCompleted: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ]);

    const statsDoc = await UserStatsModel.findOne({ user: userId }).select("currentStreak level");

    // Productivity score: simple formula
    const totalSessions     = focusAgg?.totalSessions     || 0;
    const completedSessions = focusAgg?.completedSessions || 0;
    const tasksCreated      = taskAgg?.tasksCreated       || 0;
    const tasksCompleted    = taskAgg?.tasksCompleted      || 0;
    const distractionsCount = focusAgg?.distractionsCount || 0;

    const sessionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 50 : 0;
    const taskRate    = tasksCreated  > 0 ? (tasksCompleted    / tasksCreated)   * 30 : 0;
    const productivityScore = Math.max(0, Math.round(sessionRate + taskRate - distractionsCount * 2));

    const aiResult = await analyzeProductivity({
      totalFocusMinutes: focusAgg?.totalFocusMinutes || 0,
      totalSessions,
      completedSessions,
      tasksCreated,
      tasksCompleted,
      distractionsCount,
      currentStreak: statsDoc?.currentStreak || 0,
      productivityScore,
      period,
    });

    return res.status(200).json({
      message: "Productivity analysis complete",
      success: true,
      analysis: aiResult,
      rawStats: {
        totalFocusMinutes: focusAgg?.totalFocusMinutes || 0,
        totalSessions,
        completedSessions,
        tasksCreated,
        tasksCompleted,
        distractionsCount,
        productivityScore,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "AI analysis failed",
      success: false,
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/ai/focus-suggestions
// Analyzes focus patterns and returns personalized session recommendations.
// Body (optional): { tasksBacklog }
// ---------------------------------------------------------------------------
export const focusSuggestions = async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const userId = req.user._id;
    const { tasksBacklog } = req.body || {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate patterns from last 30 days
    const [patterns] = await focusSessionModel.aggregate([
      { $match: { user: userId, startedAt: { $gte: thirtyDaysAgo }, completed: true } },
      {
        $group: {
          _id: null,
          avgSessionLength: { $avg: "$duration" },
          avgDistractions:  { $avg: "$distractions" },
          // Most common hour of day
          sessions: { $push: { hour: { $hour: "$startedAt" }, mode: "$timerType" } },
        },
      },
    ]);

    // Find peak focus hour
    let peakHour = 9; // default morning
    if (patterns?.sessions?.length > 0) {
      const hourCounts = {};
      patterns.sessions.forEach(({ hour }) => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      peakHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0]);
    }

    // Most common timer mode
    let preferredMode = "pomodoro";
    if (patterns?.sessions?.length > 0) {
      const modeCounts = {};
      patterns.sessions.forEach(({ mode }) => {
        modeCounts[mode] = (modeCounts[mode] || 0) + 1;
      });
      preferredMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0][0] || "pomodoro";
    }

    // Last 5 moods
    const recentSessions = await focusSessionModel
      .find({ user: userId, mood: { $exists: true, $ne: null } })
      .sort({ startedAt: -1 })
      .limit(5)
      .select("mood");
    const recentMoods = recentSessions.map((s) => s.mood).filter(Boolean);

    // Pending tasks count
    const pendingTasksCount = tasksBacklog !== undefined
      ? tasksBacklog
      : await taskModel.countDocuments({ user: userId, status: { $ne: "completed" } });

    const aiResult = await getFocusSuggestions({
      avgSessionLength: Math.round(patterns?.avgSessionLength || 25),
      peakHour,
      avgDistractions:  Number((patterns?.avgDistractions || 0).toFixed(1)),
      preferredMode,
      recentMoods,
      tasksBacklog: pendingTasksCount,
    });

    return res.status(200).json({
      message: "Focus suggestions generated",
      success: true,
      suggestions: aiResult,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Failed to generate suggestions",
      success: false,
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/ai/weekly-report
// Generates a full narrative weekly report from the last 7 heatmap snapshots.
// ---------------------------------------------------------------------------
export const weeklyReport = async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const userId = req.user._id;

    // Get last 7 days of heatmap data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const fromStr = sevenDaysAgo.toISOString().split("T")[0];

    const heatmapDays = await HeatmapModel.find({
      user: userId,
      date: { $gte: fromStr },
    })
      .sort({ date: 1 })
      .select("date focusMinutes sessionsCompleted tasksCompleted distractions level")
      .lean();

    // Fill missing days with zeros
    const dayMap = {};
    heatmapDays.forEach((d) => { dayMap[d.date] = d; });

    const days = [];
    const cursor = new Date(sevenDaysAgo);
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().split("T")[0];
      days.push(dayMap[key] || {
        date: key, focusMinutes: 0, sessionsCompleted: 0, tasksCompleted: 0, distractions: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // User stats
    const statsDoc = await UserStatsModel.findOne({ user: userId })
      .select("level currentStreak longestStreak xp badges");

    // New badges earned this week
    const weekStart = new Date(sevenDaysAgo);
    const newBadges = (statsDoc?.badges || [])
      .filter((b) => new Date(b.earnedAt) >= weekStart)
      .map((b) => `${b.icon} ${b.name}`);

    // XP this week (from xpLog)
    const statsWithLog = await UserStatsModel.findOne({ user: userId }).select("xpLog");
    const weeklyXP = (statsWithLog?.xpLog || [])
      .filter((e) => new Date(e.earnedAt) >= weekStart)
      .reduce((a, e) => a + e.amount, 0);

    const aiResult = await generateWeeklyReport({
      days,
      userLevel:     statsDoc?.level          || 1,
      currentStreak: statsDoc?.currentStreak  || 0,
      longestStreak: statsDoc?.longestStreak  || 0,
      totalXP:       Math.max(0, weeklyXP),
      newBadges,
    });

    return res.status(200).json({
      message: "Weekly report generated",
      success: true,
      report: aiResult,
      period: { from: fromStr, to: new Date().toISOString().split("T")[0] },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Failed to generate weekly report",
      success: false,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/ai/adaptive-timer
// Pulls 14-day session patterns and returns AI-suggested optimal duration
// ---------------------------------------------------------------------------
export const adaptiveTimer = async (req, res) => {
  if (!checkApiKey(res)) return;
  try {
    const userId = req.user._id;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [agg] = await focusSessionModel.aggregate([
      { $match: { user: userId, startedAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: null,
          avgSessionLength: { $avg: "$duration" },
          totalSessions:    { $sum: 1 },
          completedSessions:{ $sum: { $cond: ["$completed", 1, 0] } },
          totalDistractions:{ $sum: "$distractions" },
          preferredMode:    { $last: "$timerType" },
        },
      },
    ]);

    const statsDoc = await UserStatsModel.findOne({ user: userId }).select("currentStreak totalSessionsCompleted");

    const totalSessions    = agg?.totalSessions    || 0;
    const completedSessions= agg?.completedSessions|| 0;
    const completionRate   = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const avgDistractions  = totalSessions > 0 ? Number(((agg?.totalDistractions || 0) / totalSessions).toFixed(1)) : 0;

    const suggestion = await getAdaptiveTimer({
      avgSessionLength: Math.round(agg?.avgSessionLength || 25),
      completionRate,
      avgDistractions,
      preferredMode: agg?.preferredMode || "pomodoro",
      currentStreak: statsDoc?.currentStreak || 0,
      totalSessions: statsDoc?.totalSessionsCompleted || 0,
    });

    return res.status(200).json({
      success: true,
      suggestion,
      basedOn: { totalSessions, completionRate, avgDistractions },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Adaptive timer failed", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/ai/burnout-check
// Analyzes last 7 days for burnout/overwork signals
// ---------------------------------------------------------------------------
export const burnoutCheck = async (req, res) => {
  if (!checkApiKey(res)) return;
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [agg] = await focusSessionModel.aggregate([
      { $match: { user: userId, startedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          sessions:          { $sum: 1 },
          completed:         { $sum: { $cond: ["$completed", 1, 0] } },
          totalDistractions: { $sum: "$distractions" },
          avgSessionLength:  { $avg: "$duration" },
        },
      },
    ]);

    // Recent mood trend (last 5)
    const recentMoods = await focusSessionModel
      .find({ user: userId, mood: { $exists: true, $ne: null } })
      .sort({ startedAt: -1 })
      .limit(5)
      .select("mood")
      .lean();
    const moodTrend = recentMoods.map((s) => s.mood).join(", ") || "not tracked";

    const statsDoc = await UserStatsModel.findOne({ user: userId }).select("currentStreak");

    const sessions   = agg?.sessions   || 0;
    const completed  = agg?.completed  || 0;
    const completionRate = sessions > 0 ? Math.round((completed / sessions) * 100) : 100;
    const avgDistractions= sessions > 0 ? Number(((agg?.totalDistractions || 0) / sessions).toFixed(1)) : 0;

    const result = await detectBurnout({
      avgDistractions7d:  avgDistractions,
      sessionsLast7d:     sessions,
      completionRate7d:   completionRate,
      streak:             statsDoc?.currentStreak || 0,
      avgSessionLength:   Math.round(agg?.avgSessionLength || 0),
      moodTrend,
    });

    return res.status(200).json({
      success: true,
      burnout: result,
      rawData: { sessions, completionRate, avgDistractions },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Burnout check failed", success: false });
  }
};
