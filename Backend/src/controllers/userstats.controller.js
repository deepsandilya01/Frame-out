import UserStatsModel, { XP_REWARDS, BADGE_DEFINITIONS, LEVEL_THRESHOLDS, getLevelProgress } from "../models/userstats.model.js";
import { gamificationService } from "../services/gamification.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get the logged-in user's full stats
// @route   GET /api/userstats/me
export const getMyStats = asyncHandler(async (req, res) => {
  let stats = await UserStatsModel.findOne({ user: req.user._id });

  if (!stats) {
    stats = await UserStatsModel.create({ user: req.user._id });
  }

  if (stats.syncLevelProgress()) {
    await stats.save();
  }

  const progress = getLevelProgress(stats.xp);

  res.status(200).json({
    message: "User stats retrieved",
    success: true,
    stats: {
      xp:                     stats.xp,
      level:                  stats.level,
      xpToNextLevel:          stats.xpToNextLevel,
      currentLevelXp:         progress.currentLevelXp,
      nextLevelXp:            progress.nextLevelXp,
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
});

// @desc    Award XP after completing a focus session
// @route   POST /api/userstats/award-session
export const awardSessionXP = asyncHandler(async (req, res) => {
  const { minutes = 0, distractions = 0, timerType = "custom", startHour } = req.body;

  const result = await gamificationService.awardSessionRewards(req.user._id, {
    actualMinutes: Number(minutes),
    distractions: Number(distractions),
    timerType,
    startHour: startHour || new Date().getHours(),
  });

  res.status(200).json({
    message: "Session rewards awarded",
    success: true,
    xpGained: result.xpGained,
    newLevel: result.stats.level,
    newBadges: result.newBadges,
    stats: summarize(result.stats),
  });
});

// @desc    Award XP after completing a task
// @route   POST /api/userstats/award-task
export const awardTaskXP = asyncHandler(async (req, res) => {
  const result = await gamificationService.awardTaskRewards(req.user._id);

  res.status(200).json({
    message: "Task reward awarded",
    success: true,
    xpGained: XP_REWARDS.TASK_COMPLETED,
    newLevel: result.stats.level,
    leveledUp: result.leveled,
    newBadges: result.newBadges,
    stats: summarize(result.stats),
  });
});

// @desc    Award bonus XP for a perfect day
// @route   POST /api/userstats/perfect-day
export const awardPerfectDay = asyncHandler(async (req, res) => {
  let stats = await UserStatsModel.findOne({ user: req.user._id });
  if (!stats) stats = await UserStatsModel.create({ user: req.user._id });

  stats.addXP(XP_REWARDS.PERFECT_DAY, "PERFECT_DAY");
  stats.perfectDays += 1;
  stats.awardBadge("PERFECT_DAY");

  await stats.save();

  res.status(200).json({
    message: "Perfect Day XP awarded! 🎉",
    success: true,
    xpGained: XP_REWARDS.PERFECT_DAY,
    stats: summarize(stats),
  });
});

// @desc    Get the last 100 XP events
// @route   GET /api/userstats/xp-log
export const getXPLog = asyncHandler(async (req, res) => {
  const stats = await UserStatsModel.findOne({ user: req.user._id }).select("xpLog");

  res.status(200).json({
    message: "XP log fetched",
    success: true,
    xpLog: stats?.xpLog?.slice().reverse() || [],
  });
});

// @desc    Get top users by XP
// @route   GET /api/userstats/leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const top = await UserStatsModel.find()
    .sort({ xp: -1 })
    .limit(20)
    .populate("user", "fullname");

  const leaderboard = top.map((s, i) => ({
    rank:     i + 1,
    fullname: s.user?.fullname || "Anonymous",
    level:    s.level,
    xp:       s.xp,
    streak:   s.currentStreak,
    badges:   s.badges.length,
  }));

  res.status(200).json({
    message: "Leaderboard fetched",
    success: true,
    leaderboard,
  });
});

// @desc    Get all badge definitions
// @route   GET /api/userstats/badges
export const getAllBadges = asyncHandler(async (req, res) => {
  const stats = await UserStatsModel.findOne({ user: req.user._id }).select("badges");
  const earned = new Set((stats?.badges || []).map((b) => b.id));

  const allBadges = Object.values(BADGE_DEFINITIONS).map((def) => ({
    ...def,
    earned:   earned.has(def.id),
    earnedAt: stats?.badges.find((b) => b.id === def.id)?.earnedAt || null,
  }));

  res.status(200).json({
    message: "Badges fetched",
    success: true,
    badges: allBadges,
    earnedCount: earned.size,
    totalCount:  allBadges.length,
  });
});

// @desc    Get XP thresholds for all levels
// @route   GET /api/userstats/level-map
export const getLevelMap = asyncHandler(async (_req, res) => {
  const map = LEVEL_THRESHOLDS.map((xp, i) => ({
    level: i + 1,
    xpRequired: xp,
  }));
  res.status(200).json({ success: true, levels: map });
});

// Private helpers
function summarize(stats) {
  const progress = getLevelProgress(stats.xp);

  return {
    xp:            stats.xp,
    level:         stats.level,
    xpToNextLevel: stats.xpToNextLevel,
    currentLevelXp: progress.currentLevelXp,
    nextLevelXp:    progress.nextLevelXp,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    badgesCount:   stats.badges.length,
  };
}
