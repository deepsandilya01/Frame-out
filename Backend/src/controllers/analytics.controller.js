import AnalyticsModel from "../models/analytics.model.js";
import focusSessionModel from "../models/focussession.model.js";
import taskModel from "../models/task.model.js";
import userModel from "../models/user.model.js";

// ---------------------------------------------------------------------------
// Helper: get midnight UTC for a given date
// ---------------------------------------------------------------------------
function toMidnightUTC(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Helper: compute productivity score (0–100)
// ---------------------------------------------------------------------------
function calcProductivityScore({ completedSessions, totalSessions, tasksCompleted, tasksCreated, distractionsCount }) {
  if (totalSessions === 0 && tasksCreated === 0) return 0;

  const sessionRate  = totalSessions  > 0 ? (completedSessions / totalSessions) * 50  : 0;
  const taskRate     = tasksCreated   > 0 ? (tasksCompleted    / tasksCreated)   * 30  : 0;
  const disPenalty   = Math.min(distractionsCount * 2, 20);

  return Math.max(0, Math.round(sessionRate + taskRate - disPenalty));
}

// ---------------------------------------------------------------------------
// Helper: compute dopamine score
// focus minutes × 0.5 + tasks completed × 5 − distractions × 2
// ---------------------------------------------------------------------------
function calcDopamineScore({ totalFocusMinutes, tasksCompleted, distractionsCount }) {
  return Math.max(0, Math.round(
    totalFocusMinutes * 0.5 + tasksCompleted * 5 - distractionsCount * 2
  ));
}

// ---------------------------------------------------------------------------
// POST /api/analytics/sync
// Rebuilds today's snapshot from raw session + task data.
// Call this after ending a focus session or completing a task.
// ---------------------------------------------------------------------------
export const syncTodayAnalytics = async (req, res) => {
  try {
    const userId  = req.user._id;
    const today   = toMidnightUTC();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // --- Aggregate focus sessions for today ---
    const [focusAgg] = await focusSessionModel.aggregate([
      {
        $match: {
          user: userId,
          startedAt: { $gte: today, $lt: tomorrow },
        },
      },
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

    // --- Aggregate tasks for today ---
    const [taskAgg] = await taskModel.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          tasksCreated:   { $sum: 1 },
          tasksCompleted: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ]);

    const user = await userModel.findById(userId).select("streak");

    const data = {
      totalFocusMinutes: focusAgg?.totalFocusMinutes || 0,
      totalSessions:     focusAgg?.totalSessions     || 0,
      completedSessions: focusAgg?.completedSessions || 0,
      distractionsCount: focusAgg?.distractionsCount || 0,
      tasksCreated:      taskAgg?.tasksCreated       || 0,
      tasksCompleted:    taskAgg?.tasksCompleted      || 0,
      streakOnDay:       user?.streak                || 0,
    };

    data.productivityScore = calcProductivityScore(data);
    data.dopamineScore     = calcDopamineScore(data);

    // Upsert today's snapshot
    const snapshot = await AnalyticsModel.findOneAndUpdate(
      { user: userId, date: today },
      { $set: data },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Analytics synced",
      success: true,
      snapshot,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/today
// ---------------------------------------------------------------------------
export const getTodayAnalytics = async (req, res) => {
  try {
    const today = toMidnightUTC();

    const snapshot = await AnalyticsModel.findOne({
      user: req.user._id,
      date: today,
    });

    return res.status(200).json({
      message: "Today's analytics fetched",
      success: true,
      snapshot: snapshot || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/week
// Returns the last 7 days of daily snapshots
// ---------------------------------------------------------------------------
export const getWeekAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = toMidnightUTC();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    const snapshots = await AnalyticsModel.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    const totals = snapshots.reduce(
      (acc, s) => {
        acc.totalFocusMinutes += s.totalFocusMinutes;
        acc.totalSessions     += s.totalSessions;
        acc.tasksCompleted    += s.tasksCompleted;
        acc.distractionsCount += s.distractionsCount;
        return acc;
      },
      { totalFocusMinutes: 0, totalSessions: 0, tasksCompleted: 0, distractionsCount: 0 }
    );

    return res.status(200).json({
      message: "Weekly analytics fetched",
      success: true,
      snapshots,
      totals,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/month
// Returns all snapshots in the current calendar month
// ---------------------------------------------------------------------------
export const getMonthAnalytics = async (req, res) => {
  try {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);

    const snapshots = await AnalyticsModel.find({
      user: req.user._id,
      date: { $gte: start },
    }).sort({ date: 1 });

    const totals = snapshots.reduce(
      (acc, s) => {
        acc.totalFocusMinutes += s.totalFocusMinutes;
        acc.totalSessions     += s.totalSessions;
        acc.tasksCompleted    += s.tasksCompleted;
        acc.distractionsCount += s.distractionsCount;
        return acc;
      },
      { totalFocusMinutes: 0, totalSessions: 0, tasksCompleted: 0, distractionsCount: 0 }
    );

    return res.status(200).json({
      message: "Monthly analytics fetched",
      success: true,
      snapshots,
      totals,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/overview
// Returns aggregated all-time stats from the User model
// ---------------------------------------------------------------------------
export const getOverview = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("totalFocusTime totalSessions longestStreak streak rank level totalDistractions");

    // Best productivity day
    const bestDay = await AnalyticsModel.findOne({ user: req.user._id })
      .sort({ productivityScore: -1 })
      .select("date productivityScore totalFocusMinutes");

    return res.status(200).json({
      message: "Overview fetched",
      success: true,
      overview: {
        totalFocusMinutes:  user.totalFocusTime,
        totalSessions:      user.totalSessions,
        currentStreak:      user.streak,
        longestStreak:      user.longestStreak,
        totalDistractions:  user.totalDistractions,
        rank:               user.rank,
        level:              user.level,
        bestDay: bestDay
          ? { date: bestDay.date, score: bestDay.productivityScore, focusMinutes: bestDay.totalFocusMinutes }
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
