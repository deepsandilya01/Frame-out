import focusSessionModel from "../models/focussession.model.js";
import userModel from "../models/user.model.js";
import { gamificationService } from "../services/gamification.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// POMODORO DEFAULTS
const POMODORO_FOCUS_MINUTES = 25;
const POMODORO_BREAK_MINUTES = 5;

// @desc    Start a focus session
// @route   POST /api/focus/start
export const startSession = asyncHandler(async (req, res) => {
  const {
    timerType = "pomodoro",
    focusDuration,
    breakDuration,
    mode,
    mood,
  } = req.body;

  if (timerType === "custom" && !focusDuration) {
    return res.status(400).json({
      message: "focusDuration is required for custom timer",
      success: false,
    });
  }

  const resolvedFocusDuration =
    timerType === "pomodoro" ? POMODORO_FOCUS_MINUTES : Number(focusDuration);

  const resolvedBreakDuration =
    timerType === "pomodoro" ? POMODORO_BREAK_MINUTES : Number(breakDuration) || 5;

  const session = await focusSessionModel.create({
    user: req.user._id,
    timerType,
    focusDuration: resolvedFocusDuration,
    breakDuration: resolvedBreakDuration,
    mode: mode || "pomodoro",
    mood,
    startedAt: new Date(),
  });

  res.status(201).json({
    message: "Focus session started",
    success: true,
    session,
    timer: {
      focusMinutes: resolvedFocusDuration,
      breakMinutes: resolvedBreakDuration,
    },
  });
});

// @desc    End an active focus session
// @route   POST /api/focus/end
export const endSession = asyncHandler(async (req, res) => {
  const { sessionId, distractions = 0, notes, mood, completed = true } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required", success: false });
  }

  const session = await focusSessionModel.findOne({
    _id: sessionId,
    user: req.user._id,
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found", success: false });
  }

  if (session.endedAt) {
    return res.status(400).json({ message: "Session already ended", success: false });
  }

  const endedAt = new Date();
  const actualMinutes = Math.min(
    Math.round((endedAt - session.startedAt) / 60000),
    session.focusDuration
  );

  session.endedAt      = endedAt;
  session.duration     = actualMinutes;
  session.completed    = completed;
  session.distractions = Number(distractions);
  if (notes !== undefined) session.notes = notes;
  if (mood  !== undefined) session.mood  = mood;
  await session.save();

  let gamification = null;

  if (completed) {
    // Award XP + badges via Centralized Service
    const startHour = session.startedAt.getHours();
    const result = await gamificationService.awardSessionRewards(req.user._id, {
      actualMinutes,
      distractions: Number(distractions),
      timerType: session.timerType,
      startHour,
    });

    gamification = {
      xpEarned:  result.xpGained,
      xp:        result.stats.xp,
      level:     result.stats.level,
      streak:    result.stats.currentStreak,
      newBadges: result.newBadges,
      leveledUp: result.leveled,
    };
  }

  res.status(200).json({
    message: "Focus session ended successfully",
    success: true,
    session,
    nextBreak: completed ? session.breakDuration : null,
    gamification,
  });
});

// @desc    Get paginated focus history
// @route   GET /api/focus/histories
export const getHistories = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;

  const [sessions, total] = await Promise.all([
    focusSessionModel
      .find({ user: req.user._id })
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    focusSessionModel.countDocuments({ user: req.user._id })
  ]);

  res.status(200).json({
    message: "Focus session history fetched",
    success: true,
    sessions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get user focus stats
// @route   GET /api/focus/stats
export const getStats = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user._id)
    .select("totalFocusTime totalSessions longestStreak streak rank level totalDistractions");

  if (!user) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  const avgDistractions =
    user.totalSessions > 0
      ? (user.totalDistractions / user.totalSessions).toFixed(1)
      : 0;

  res.status(200).json({
    message: "Stats fetched successfully",
    success: true,
    stats: {
      totalFocusTime:           user.totalFocusTime,
      totalSessions:            user.totalSessions,
      longestStreak:            user.longestStreak,
      currentStreak:            user.streak,
      rank:                     user.rank,
      level:                    user.level,
      avgDistractionsPerSession: Number(avgDistractions),
    },
  });
});

// @desc    Get today's sessions
// @route   GET /api/focus/today
export const getTodaySessions = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const sessions = await focusSessionModel
    .find({ user: req.user._id, startedAt: { $gte: start, $lte: end } })
    .sort({ startedAt: -1 })
    .lean();

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  res.status(200).json({
    message: "Today's sessions fetched successfully",
    success: true,
    sessions,
    totalMinutes,
  });
});

// @desc    Get this week's sessions
// @route   GET /api/focus/week
export const getWeekSessions = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const sessions = await focusSessionModel
    .find({ user: req.user._id, startedAt: { $gte: start } })
    .sort({ startedAt: -1 })
    .lean();

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  res.status(200).json({
    message: "This week's sessions fetched successfully",
    success: true,
    sessions,
    totalMinutes,
  });
});

// @desc    Get this month's sessions
// @route   GET /api/focus/month
export const getMonthSessions = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const sessions = await focusSessionModel
    .find({ user: req.user._id, startedAt: { $gte: start } })
    .sort({ startedAt: -1 })
    .lean();

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  res.status(200).json({
    message: "This month's sessions fetched successfully",
    success: true,
    sessions,
    totalMinutes,
  });
});

// @desc    Get calendar data for current month
// @route   GET /api/focus/calendar
export const getCalendar = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const sessions = await focusSessionModel.find({
    user: req.user._id,
    startedAt: { $gte: start },
    completed: true,
  }).lean();

  const calendar = {};
  sessions.forEach((s) => {
    const dateKey = s.startedAt.toISOString().split("T")[0];
    calendar[dateKey] = (calendar[dateKey] || 0) + (s.duration || 0);
  });

  res.status(200).json({
    message: "Calendar data fetched successfully",
    success: true,
    calendar,
  });
});

// @desc    Get mood analytics for last 30 days
// @route   GET /api/focus/mood-analytics
export const getMoodAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Aggregate mood counts + avg focus per mood
  const moodAgg = await focusSessionModel.aggregate([
    {
      $match: {
        user: userId,
        mood: { $exists: true, $ne: null },
        startedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: "$mood",
        count:      { $sum: 1 },
        avgFocus:   { $avg: "$duration" },
        totalFocus: { $sum: "$duration" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Mood trend (last 14 days, grouped by date)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const trendRaw = await focusSessionModel.find({
    user: userId,
    mood: { $exists: true, $ne: null },
    startedAt: { $gte: fourteenDaysAgo },
  })
    .sort({ startedAt: 1 })
    .select("mood duration startedAt")
    .lean();

  // Group by date
  const trendMap = {};
  trendRaw.forEach((s) => {
    const d = s.startedAt.toISOString().split("T")[0];
    if (!trendMap[d]) trendMap[d] = { date: d, moods: [], totalFocus: 0 };
    trendMap[d].moods.push(s.mood);
    trendMap[d].totalFocus += s.duration || 0;
  });

  const trend = Object.values(trendMap).map((day) => ({
    date: day.date,
    dominantMood: (() => {
      const counts = {};
      day.moods.forEach((m) => { counts[m] = (counts[m] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
    })(),
    totalFocus: day.totalFocus,
    sessionCount: day.moods.length,
  }));

  const distribution = moodAgg.map((m) => ({
    mood:       m._id,
    count:      m.count,
    avgFocus:   Math.round(m.avgFocus || 0),
    totalFocus: m.totalFocus || 0,
  }));

  // Best mood for productivity (highest avg focus)
  const bestMood = [...distribution].sort((a, b) => b.avgFocus - a.avgFocus)[0]?.mood || null;

  res.status(200).json({
    message:      "Mood analytics fetched successfully",
    success:      true,
    distribution,
    trend,
    bestMood,
    totalTracked: trendRaw.length,
  });
});