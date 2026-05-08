import focusSessionModel from "../models/focussession.model.js";
import userModel from "../models/user.model.js";
import UserStatsModel, { XP_REWARDS, BADGE_DEFINITIONS } from "../models/userstats.model.js";

// ---------------------------------------------------------------------------
// POMODORO DEFAULTS
// ---------------------------------------------------------------------------
const POMODORO_FOCUS_MINUTES = 25;
const POMODORO_BREAK_MINUTES = 5;

// ---------------------------------------------------------------------------
// Helper: today's date as "YYYY-MM-DD" string (local timezone safe)
// ---------------------------------------------------------------------------
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function prevDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Helper: compute rank from total focus minutes (for User model)
// ---------------------------------------------------------------------------
function computeRank(totalFocusTime) {
  if (totalFocusTime >= 3000) return "Grandmaster";
  if (totalFocusTime >= 1500) return "Master";
  if (totalFocusTime >= 600)  return "Expert";
  if (totalFocusTime >= 200)  return "Intermediate";
  return "Newbie";
}

// ---------------------------------------------------------------------------
// Helper: auto-award XP + badges to UserStats after a session ends
// This keeps the gamification layer in sync without extra API calls
// ---------------------------------------------------------------------------
async function awardGamificationRewards(userId, { actualMinutes, distractions, timerType, startHour }) {
  try {
    let stats = await UserStatsModel.findOne({ user: userId });
    if (!stats) stats = await UserStatsModel.create({ user: userId });

    const newBadges = [];

    // Base XP
    stats.addXP(XP_REWARDS.SESSION_COMPLETED, "SESSION_COMPLETED");

    // Pomodoro bonus
    if (timerType === "pomodoro") {
      stats.addXP(XP_REWARDS.SESSION_POMODORO, "SESSION_POMODORO");
    }

    // Early bird bonus (before 7AM)
    if (startHour !== undefined && Number(startHour) < 7) {
      stats.addXP(15, "EARLY_BIRD_BONUS");
      if (stats.awardBadge("EARLY_BIRD")) newBadges.push("EARLY_BIRD");
    }

    // Distraction penalty
    if (distractions > 0) {
      stats.addXP(XP_REWARDS.DISTRACTION_PENALTY * distractions, "DISTRACTION_PENALTY");
    } else {
      if (stats.awardBadge("NO_DISTRACTION")) newBadges.push("NO_DISTRACTION");
    }

    // Update counters
    stats.totalSessionsCompleted += 1;
    stats.totalDistractions += distractions;
    stats.totalFocusMinutes += actualMinutes; // ← FIX: was missing

    // Streak logic — only advance once per calendar day
    const today = todayStr();
    const last  = stats.lastActiveDate;

    if (last !== today) {
      if (last === prevDay(today)) {
        stats.currentStreak += 1; // consecutive day
      } else {
        stats.currentStreak = 1;  // streak broken — reset
      }
      stats.lastActiveDate = today;
    }
    // If last === today: same day, no streak change

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    // Streak XP bonus (capped at ×10)
    const streakBonus = XP_REWARDS.STREAK_BONUS * Math.min(stats.currentStreak, 10);
    stats.addXP(streakBonus, "STREAK_BONUS");

    // Milestone badges
    if (stats.totalSessionsCompleted >= 1 && stats.awardBadge("FIRST_SESSION")) newBadges.push("FIRST_SESSION");
    if (stats.currentStreak >= 3  && stats.awardBadge("STREAK_3"))   newBadges.push("STREAK_3");
    if (stats.currentStreak >= 7  && stats.awardBadge("STREAK_7"))   newBadges.push("STREAK_7");
    if (stats.currentStreak >= 30 && stats.awardBadge("STREAK_30"))  newBadges.push("STREAK_30");
    if (stats.totalFocusMinutes >= 6000 && stats.awardBadge("FOCUS_100")) newBadges.push("FOCUS_100");
    if (stats.level >= 5  && stats.awardBadge("LEVEL_5"))  newBadges.push("LEVEL_5");
    if (stats.level >= 10 && stats.awardBadge("LEVEL_10")) newBadges.push("LEVEL_10");

    await stats.save();
    return { stats, newBadges };
  } catch (err) {
    console.error("Gamification reward error:", err);
    return { stats: null, newBadges: [] };
  }
}

// ---------------------------------------------------------------------------
// POST /api/focus/start
// Body: { timerType: "pomodoro" | "custom", focusDuration?, breakDuration?, mode?, mood? }
// ---------------------------------------------------------------------------
export const startSession = async (req, res) => {
  try {
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

    return res.status(201).json({
      message: "Focus session started",
      success: true,
      session,
      timer: {
        focusMinutes: resolvedFocusDuration,
        breakMinutes: resolvedBreakDuration,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// POST /api/focus/end
// Body: { sessionId, distractions?, notes?, mood?, completed? }
// ---------------------------------------------------------------------------
export const endSession = async (req, res) => {
  try {
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

    // --- Update User model (rank/streak/totals) ---
    const user = await userModel.findById(req.user._id);
    if (completed) {
      user.totalFocusTime    += actualMinutes;
      user.totalSessions     += 1;
      user.totalDistractions += Number(distractions);

      // Streak — once per day on User model
      const today        = todayStr();
      const lastResetDay = new Date(user.lastStreakReset).toISOString().split("T")[0];

      if (lastResetDay !== today) {
        const diffDays = Math.floor((new Date() - new Date(user.lastStreakReset)) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          user.streak += 1;
        } else {
          user.streak = 1; // reset
        }
        user.lastStreakReset = new Date();
        if (user.streak > user.longestStreak) user.longestStreak = user.streak;
      }

      user.rank = computeRank(user.totalFocusTime);
      await user.save();
    }

    // --- Auto-award XP + badges to UserStats (gamification) ---
    const startHour = session.startedAt.getHours();
    const { stats: gamStats, newBadges } = await awardGamificationRewards(req.user._id, {
      actualMinutes,
      distractions: Number(distractions),
      timerType: session.timerType,
      startHour,
    });

    return res.status(200).json({
      message: "Focus session ended",
      success: true,
      session,
      nextBreak: completed ? session.breakDuration : null,
      // Gamification response
      gamification: gamStats
        ? {
            xp:        gamStats.xp,
            level:     gamStats.level,
            streak:    gamStats.currentStreak,
            newBadges,
            leveledUp: newBadges.includes("LEVEL_5") || newBadges.includes("LEVEL_10"),
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/histories   — all sessions (paginated)
// ---------------------------------------------------------------------------
export const getHistories = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const sessions = await focusSessionModel
      .find({ user: req.user._id })
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await focusSessionModel.countDocuments({ user: req.user._id });

    return res.status(200).json({
      message: "Focus session history fetched",
      success: true,
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/stats
// ---------------------------------------------------------------------------
export const getStats = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("totalFocusTime totalSessions longestStreak streak rank level totalDistractions");

    const avgDistractions =
      user.totalSessions > 0
        ? (user.totalDistractions / user.totalSessions).toFixed(1)
        : 0;

    return res.status(200).json({
      message: "Stats fetched",
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/today
// ---------------------------------------------------------------------------
export const getTodaySessions = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sessions = await focusSessionModel
      .find({ user: req.user._id, startedAt: { $gte: start, $lte: end } })
      .sort({ startedAt: -1 });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    return res.status(200).json({
      message: "Today's sessions fetched",
      success: true,
      sessions,
      totalMinutes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/week
// ---------------------------------------------------------------------------
export const getWeekSessions = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    const sessions = await focusSessionModel
      .find({ user: req.user._id, startedAt: { $gte: start } })
      .sort({ startedAt: -1 });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    return res.status(200).json({
      message: "This week's sessions fetched",
      success: true,
      sessions,
      totalMinutes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/month
// ---------------------------------------------------------------------------
export const getMonthSessions = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const sessions = await focusSessionModel
      .find({ user: req.user._id, startedAt: { $gte: start } })
      .sort({ startedAt: -1 });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    return res.status(200).json({
      message: "This month's sessions fetched",
      success: true,
      sessions,
      totalMinutes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/calendar
// ---------------------------------------------------------------------------
export const getCalendar = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const sessions = await focusSessionModel.find({
      user: req.user._id,
      startedAt: { $gte: start },
      completed: true,
    });

    const calendar = {};
    sessions.forEach((s) => {
      const dateKey = s.startedAt.toISOString().split("T")[0];
      calendar[dateKey] = (calendar[dateKey] || 0) + (s.duration || 0);
    });

    return res.status(200).json({
      message: "Calendar data fetched",
      success: true,
      calendar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/focus/mood-analytics
// Returns mood distribution + avg focus time per mood (last 30 days)
// ---------------------------------------------------------------------------
export const getMoodAnalytics = async (req, res) => {
  try {
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

    const MOOD_ORDER = ["sleepy", "calm", "happy", "motivated", "energized"];
    const distribution = moodAgg.map((m) => ({
      mood:       m._id,
      count:      m.count,
      avgFocus:   Math.round(m.avgFocus || 0),
      totalFocus: m.totalFocus || 0,
    }));

    // Best mood for productivity (highest avg focus)
    const bestMood = [...distribution].sort((a, b) => b.avgFocus - a.avgFocus)[0]?.mood || null;

    return res.status(200).json({
      message:      "Mood analytics fetched",
      success:      true,
      distribution,
      trend,
      bestMood,
      totalTracked: trendRaw.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};