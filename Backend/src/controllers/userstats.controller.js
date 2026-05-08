import UserStatsModel, {
  XP_REWARDS,
  BADGE_DEFINITIONS,
  LEVEL_THRESHOLDS,
} from "../models/userstats.model.js";

// ---------------------------------------------------------------------------
// Helper: get or create a UserStats document for the logged-in user
// ---------------------------------------------------------------------------
async function getOrCreateStats(userId) {
  let stats = await UserStatsModel.findOne({ user: userId });
  if (!stats) {
    stats = await UserStatsModel.create({ user: userId });
  }
  return stats;
}

// ---------------------------------------------------------------------------
// Helper: check and award milestone badges
// ---------------------------------------------------------------------------
function checkAndAwardBadges(stats) {
  const awarded = [];

  if (stats.totalSessionsCompleted >= 1)
    if (stats.awardBadge("FIRST_SESSION")) awarded.push("FIRST_SESSION");

  if (stats.currentStreak >= 3)
    if (stats.awardBadge("STREAK_3")) awarded.push("STREAK_3");

  if (stats.currentStreak >= 7)
    if (stats.awardBadge("STREAK_7")) awarded.push("STREAK_7");

  if (stats.currentStreak >= 30)
    if (stats.awardBadge("STREAK_30")) awarded.push("STREAK_30");

  if (stats.totalFocusMinutes >= 6000)  // 100 hours
    if (stats.awardBadge("FOCUS_100")) awarded.push("FOCUS_100");

  if (stats.totalTasksCompleted >= 10)
    if (stats.awardBadge("TASKS_10")) awarded.push("TASKS_10");

  if (stats.totalTasksCompleted >= 50)
    if (stats.awardBadge("TASKS_50")) awarded.push("TASKS_50");

  if (stats.level >= 5)
    if (stats.awardBadge("LEVEL_5")) awarded.push("LEVEL_5");

  if (stats.level >= 10)
    if (stats.awardBadge("LEVEL_10")) awarded.push("LEVEL_10");

  return awarded;
}

// ---------------------------------------------------------------------------
// POST /api/userstats/award-session
// Called when a focus session is completed.
// Body: { sessionId, distractions, timerType, startHour }
// ---------------------------------------------------------------------------
export const awardSessionXP = async (req, res) => {
  try {
    const { distractions = 0, timerType = "custom", startHour } = req.body;
    const userId = req.user._id;

    const stats = await getOrCreateStats(userId);
    const leveled = [];

    // Base XP for completing a session
    if (stats.addXP(XP_REWARDS.SESSION_COMPLETED, "SESSION_COMPLETED")) leveled.push(stats.level);

    // Pomodoro bonus
    if (timerType === "pomodoro") {
      stats.addXP(XP_REWARDS.SESSION_POMODORO, "SESSION_POMODORO");
    }

    // Early bird bonus (before 7AM)
    if (startHour !== undefined && Number(startHour) < 7) {
      stats.addXP(15, "EARLY_BIRD_BONUS");
      if (stats.awardBadge("EARLY_BIRD")) {
        // badge awarded
      }
    }

    // Distraction penalty
    if (distractions > 0) {
      stats.addXP(XP_REWARDS.DISTRACTION_PENALTY * distractions, "DISTRACTION_PENALTY");
    }

    // No-distraction badge
    if (distractions === 0) {
      stats.awardBadge("NO_DISTRACTION");
    }

    // Update counters
    stats.totalSessionsCompleted += 1;
    stats.totalDistractions += distractions;

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const last  = stats.lastActiveDate;
    if (last === today) {
      // same day — no streak change
    } else if (last === getPrevDay(today)) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1; // reset
    }
    stats.lastActiveDate = today;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    // Streak XP bonus (capped at ×10)
    const streakBonus = XP_REWARDS.STREAK_BONUS * Math.min(stats.currentStreak, 10);
    stats.addXP(streakBonus, "STREAK_BONUS");

    // Milestone badges
    const newBadges = checkAndAwardBadges(stats);

    await stats.save();

    return res.status(200).json({
      message: "XP awarded for session",
      success: true,
      xpGained: XP_REWARDS.SESSION_COMPLETED + streakBonus,
      newLevel: stats.level,
      leveledUp: leveled.length > 0,
      newBadges,
      stats: summarize(stats),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// POST /api/userstats/award-task
// Called when a task is marked completed.
// Body: { focusMinutesAdded? }
// ---------------------------------------------------------------------------
export const awardTaskXP = async (req, res) => {
  try {
    const { focusMinutesAdded = 0 } = req.body;
    const userId = req.user._id;

    const stats = await getOrCreateStats(userId);

    const leveled = stats.addXP(XP_REWARDS.TASK_COMPLETED, "TASK_COMPLETED");
    stats.totalTasksCompleted += 1;
    if (focusMinutesAdded > 0) stats.totalFocusMinutes += focusMinutesAdded;

    const newBadges = checkAndAwardBadges(stats);
    await stats.save();

    return res.status(200).json({
      message: "XP awarded for task",
      success: true,
      xpGained: XP_REWARDS.TASK_COMPLETED,
      newLevel: stats.level,
      leveledUp: leveled,
      newBadges,
      stats: summarize(stats),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// POST /api/userstats/perfect-day
// Called when a "perfect day" threshold is hit (4+ sessions, 3+ tasks).
// ---------------------------------------------------------------------------
export const awardPerfectDay = async (req, res) => {
  try {
    const stats = await getOrCreateStats(req.user._id);

    stats.addXP(XP_REWARDS.PERFECT_DAY, "PERFECT_DAY");
    stats.perfectDays += 1;
    stats.awardBadge("PERFECT_DAY");

    await stats.save();

    return res.status(200).json({
      message: "Perfect Day XP awarded! 🎉",
      success: true,
      xpGained: XP_REWARDS.PERFECT_DAY,
      stats: summarize(stats),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/userstats/me
// Returns the full stats + badges for the logged-in user
// ---------------------------------------------------------------------------
export const getMyStats = async (req, res) => {
  try {
    const stats = await getOrCreateStats(req.user._id);

    return res.status(200).json({
      message: "Stats fetched",
      success: true,
      stats: {
        xp:                     stats.xp,
        level:                  stats.level,
        xpToNextLevel:          stats.xpToNextLevel,
        currentStreak:          stats.currentStreak,
        longestStreak:          stats.longestStreak,
        totalSessionsCompleted: stats.totalSessionsCompleted,
        totalTasksCompleted:    stats.totalTasksCompleted,
        totalFocusMinutes:      stats.totalFocusMinutes,
        totalDistractions:      stats.totalDistractions,
        perfectDays:            stats.perfectDays,
        badges:                 stats.badges,
        lastActiveDate:         stats.lastActiveDate,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/userstats/xp-log
// Returns last 100 XP events
// ---------------------------------------------------------------------------
export const getXPLog = async (req, res) => {
  try {
    const stats = await UserStatsModel.findOne({ user: req.user._id }).select("xpLog");

    return res.status(200).json({
      message: "XP log fetched",
      success: true,
      xpLog: stats?.xpLog?.slice().reverse() || [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/userstats/leaderboard
// Top 10 users by XP (public — only fullname + level + xp)
// ---------------------------------------------------------------------------
export const getLeaderboard = async (req, res) => {
  try {
    const top = await UserStatsModel.find()
      .sort({ xp: -1 })
      .populate("user", "fullname");

    const leaderboard = top.map((s, i) => ({
      rank:     i + 1,
      fullname: s.user?.fullname || "Anonymous",
      level:    s.level,
      xp:       s.xp,
      streak:   s.currentStreak,
      badges:   s.badges.length,
    }));

    return res.status(200).json({
      message: "Leaderboard fetched",
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/userstats/badges
// Returns all possible badge definitions so frontend can render locked/unlocked
// ---------------------------------------------------------------------------
export const getAllBadges = async (req, res) => {
  try {
    const stats = await UserStatsModel.findOne({ user: req.user._id }).select("badges");
    const earned = new Set((stats?.badges || []).map((b) => b.id));

    const allBadges = Object.values(BADGE_DEFINITIONS).map((def) => ({
      ...def,
      earned:   earned.has(def.id),
      earnedAt: stats?.badges.find((b) => b.id === def.id)?.earnedAt || null,
    }));

    return res.status(200).json({
      message: "Badges fetched",
      success: true,
      badges: allBadges,
      earnedCount: earned.size,
      totalCount:  allBadges.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/userstats/level-map
// Returns all level thresholds so frontend can render a progress bar
// ---------------------------------------------------------------------------
export const getLevelMap = async (_req, res) => {
  const map = LEVEL_THRESHOLDS.map((xp, i) => ({
    level: i + 1,
    xpRequired: xp,
  }));
  return res.status(200).json({ success: true, levels: map });
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------
function summarize(stats) {
  return {
    xp:            stats.xp,
    level:         stats.level,
    xpToNextLevel: stats.xpToNextLevel,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    badgesCount:   stats.badges.length,
  };
}

function getPrevDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
