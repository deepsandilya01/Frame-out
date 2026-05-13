import MissionModel from "../models/mission.model.js";
import focusSessionModel from "../models/focussession.model.js";
import taskModel from "../models/task.model.js";
import UserStatsModel, { getLevelProgress } from "../models/userstats.model.js";
import userModel from "../models/user.model.js";
import { generateDailyMissions } from "../services/ai.service.js";

function summarizeStats(stats) {
  const progress = getLevelProgress(stats.xp);

  return {
    xp: stats.xp,
    level: stats.level,
    xpToNextLevel: stats.xpToNextLevel,
    currentLevelXp: progress.currentLevelXp,
    nextLevelXp: progress.nextLevelXp,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalSessionsCompleted: stats.totalSessionsCompleted,
    totalTasksCompleted: stats.totalTasksCompleted,
    totalFocusMinutes: stats.totalFocusMinutes,
    totalDistractions: stats.totalDistractions,
    perfectDays: stats.perfectDays,
    badges: stats.badges,
    lastActiveDate: stats.lastActiveDate,
  };
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// GET /api/missions/today
// Returns today's missions (generates new ones via AI if not yet created)
// ---------------------------------------------------------------------------
export const getTodayMissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const today  = todayStr();

    let doc = await MissionModel.findOne({ user: userId, date: today });
    if (doc) {
      return res.status(200).json({ success: true, missions: doc.missions, date: today, fresh: false });
    }

    // ── Generate fresh missions via AI ────────────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [sessions, tasks, statsDoc] = await Promise.all([
      focusSessionModel.aggregate([
        { $match: { user: userId, startedAt: { $gte: sevenDaysAgo } } },
        { $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            completed:     { $sum: { $cond: ["$completed", 1, 0] } },
            avgDistractions: { $avg: "$distractions" },
          }},
      ]),
      taskModel.countDocuments({ user: userId, status: { $in: ["todo", "in_progress"] } }),
      UserStatsModel.findOne({ user: userId }).select("currentStreak level xp").lean(),
    ]);

    const s = sessions[0] || {};

    const aiMissions = await generateDailyMissions({
      streak:          statsDoc?.currentStreak    || 0,
      level:           statsDoc?.level            || 1,
      tasksBacklog:    tasks                       || 0,
      totalSessions7d: s.totalSessions            || 0,
      completionRate:  s.totalSessions > 0
        ? Math.round((s.completed / s.totalSessions) * 100)
        : 0,
      avgDistractions: Math.round(s.avgDistractions || 0),
    });

    doc = await MissionModel.create({
      user: userId,
      date: today,
      missions: aiMissions,
    });

    return res.status(200).json({ success: true, missions: doc.missions, date: today, fresh: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/missions/:missionId/complete
// Mark a specific mission as completed
// ---------------------------------------------------------------------------
export const completeMission = async (req, res) => {
  try {
    const userId     = req.user._id;
    const today      = todayStr();
    const { missionId } = req.params;

    const doc = await MissionModel.findOne({ user: userId, date: today });
    if (!doc) return res.status(404).json({ success: false, message: "No missions for today" });

    const mission = doc.missions.id(missionId);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });
    if (mission.completed) return res.status(200).json({ success: true, message: "Already completed", missions: doc.missions });

    mission.completed  = true;
    mission.completedAt= new Date();
    await doc.save();

    // Award XP via UserStats with Level-up handling
    let stats = await UserStatsModel.findOne({ user: userId });
    if (!stats) stats = await UserStatsModel.create({ user: userId });
    
    const leveledUp = stats.addXP(mission.xpReward, `Mission: ${mission.title}`);
    await stats.save();
    await userModel.findByIdAndUpdate(userId, { $set: { level: stats.level } });

    return res.status(200).json({
      success: true,
      message: "Mission completed!",
      missions: doc.missions,
      xpEarned: mission.xpReward,
      leveledUp,
      stats: summarizeStats(stats),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// POST /api/missions/regenerate
// Force regenerate today's missions (1 per day limit enforced by AI gate)
// ---------------------------------------------------------------------------
export const regenerateMissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const today  = todayStr();

    // Delete existing
    await MissionModel.deleteOne({ user: userId, date: today });

    // Delegate to getTodayMissions logic (call it directly)
    return getTodayMissions(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
