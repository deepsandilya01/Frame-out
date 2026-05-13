import UserStatsModel, { XP_REWARDS, BADGE_DEFINITIONS, LEVEL_THRESHOLDS } from "../models/userstats.model.js";
import userModel from "../models/user.model.js";

/**
 * Centralized Gamification Service
 * Handles XP, Badges, Levels, and Streaks
 */
class GamificationService {
  /**
   * Award rewards for a completed focus session
   */
  async awardSessionRewards(userId, { actualMinutes, distractions, timerType, startHour }) {
    try {
      let stats = await UserStatsModel.findOne({ user: userId });
      if (!stats) stats = await UserStatsModel.create({ user: userId });

      const newBadges = [];
      const xpLog = [];

      // 1. Base XP
      stats.addXP(XP_REWARDS.SESSION_COMPLETED, "SESSION_COMPLETED");
      xpLog.push({ amount: XP_REWARDS.SESSION_COMPLETED, reason: "SESSION_COMPLETED" });

      // 2. Pomodoro Bonus
      if (timerType === "pomodoro") {
        stats.addXP(XP_REWARDS.SESSION_POMODORO, "SESSION_POMODORO");
        xpLog.push({ amount: XP_REWARDS.SESSION_POMODORO, reason: "SESSION_POMODORO" });
      }

      // 3. Early Bird Bonus (before 7AM)
      if (startHour !== undefined && Number(startHour) < 7) {
        stats.addXP(15, "EARLY_BIRD_BONUS");
        xpLog.push({ amount: 15, reason: "EARLY_BIRD_BONUS" });
        if (stats.awardBadge("EARLY_BIRD")) newBadges.push("EARLY_BIRD");
      }

      // 4. Distraction Penalty / No-Distraction Bonus
      if (distractions > 0) {
        const penalty = XP_REWARDS.DISTRACTION_PENALTY * distractions;
        stats.addXP(penalty, "DISTRACTION_PENALTY");
        xpLog.push({ amount: penalty, reason: "DISTRACTION_PENALTY" });
      } else {
        if (stats.awardBadge("NO_DISTRACTION")) newBadges.push("NO_DISTRACTION");
      }

      // 5. Update Lifetime Counters
      stats.totalSessionsCompleted += 1;
      stats.totalDistractions += distractions;
      stats.totalFocusMinutes += actualMinutes;

      // 6. Streak Logic (UserStats Model)
      const today = new Date().toISOString().split("T")[0];
      const last = stats.lastActiveDate;

      if (last !== today) {
        const prev = new Date();
        prev.setDate(prev.getDate() - 1);
        const prevStr = prev.toISOString().split("T")[0];

        if (last === prevStr) {
          stats.currentStreak += 1;
        } else {
          stats.currentStreak = 1;
        }
        stats.lastActiveDate = today;
      }

      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }

      // 7. Streak XP Bonus
      const streakBonus = XP_REWARDS.STREAK_BONUS * Math.min(stats.currentStreak, 10);
      stats.addXP(streakBonus, "STREAK_BONUS");
      xpLog.push({ amount: streakBonus, reason: "STREAK_BONUS" });

      // 8. Milestone Badges
      if (stats.totalSessionsCompleted >= 1) if (stats.awardBadge("FIRST_SESSION")) newBadges.push("FIRST_SESSION");
      if (stats.currentStreak >= 3)  if (stats.awardBadge("STREAK_3"))  newBadges.push("STREAK_3");
      if (stats.currentStreak >= 7)  if (stats.awardBadge("STREAK_7"))  newBadges.push("STREAK_7");
      if (stats.currentStreak >= 30) if (stats.awardBadge("STREAK_30")) newBadges.push("STREAK_30");
      if (stats.totalFocusMinutes >= 6000) if (stats.awardBadge("FOCUS_100")) newBadges.push("FOCUS_100");
      if (stats.level >= 5)   if (stats.awardBadge("LEVEL_5"))   newBadges.push("LEVEL_5");
      if (stats.level >= 10)  if (stats.awardBadge("LEVEL_10"))  newBadges.push("LEVEL_10");
      if (stats.level >= 25)  if (stats.awardBadge("LEVEL_25"))  newBadges.push("LEVEL_25");
      if (stats.level >= 50)  if (stats.awardBadge("LEVEL_50"))  newBadges.push("LEVEL_50");
      if (stats.level >= 100) if (stats.awardBadge("LEVEL_100")) newBadges.push("LEVEL_100");

      await stats.save();

      // 9. Sync to User Model (Legacy support & redundancy)
      // We will keep this for now but eventually the User model should be trimmed.
      await userModel.findByIdAndUpdate(userId, {
        $inc: { totalFocusTime: actualMinutes, totalSessions: 1, totalDistractions: distractions },
        $set: { streak: stats.currentStreak, longestStreak: stats.longestStreak, level: stats.level }
      });

      return { stats, newBadges, xpGained: xpLog.reduce((a, b) => a + b.amount, 0) };
    } catch (err) {
      console.error("Gamification Service Error:", err);
      throw err;
    }
  }

  /**
   * Apply XP penalty for a deleted or missed-deadline task
   */
  async applyTaskPenalty(userId, penaltyAmount = 5, reason = "TASK_DELETED") {
    try {
      let stats = await UserStatsModel.findOne({ user: userId });
      if (!stats) stats = await UserStatsModel.create({ user: userId });

      // Deduct XP (negative value), floor at 0 (handled inside addXP)
      stats.addXP(-Math.abs(penaltyAmount), reason);

      await stats.save();

      // Sync level to User model
      await userModel.findByIdAndUpdate(userId, { $set: { level: stats.level } });

      return { stats, xpLost: penaltyAmount, reason };
    } catch (err) {
      console.error("Task Penalty Error:", err);
      throw err;
    }
  }

  /**
   * Award rewards for a completed task
   */
  async awardTaskRewards(userId, xpReward = XP_REWARDS.TASK_COMPLETED) {
    try {
      let stats = await UserStatsModel.findOne({ user: userId });
      if (!stats) stats = await UserStatsModel.create({ user: userId });

      const leveled = stats.addXP(xpReward, "TASK_COMPLETED");
      stats.totalTasksCompleted += 1;

      const newBadges = [];
      if (stats.totalTasksCompleted >= 10) if (stats.awardBadge("TASKS_10")) newBadges.push("TASKS_10");
      if (stats.totalTasksCompleted >= 50) if (stats.awardBadge("TASKS_50")) newBadges.push("TASKS_50");

      await stats.save();
      
      // Sync Level to User model
      await userModel.findByIdAndUpdate(userId, { $set: { level: stats.level } });

      return { stats, newBadges, leveled };
    } catch (err) {
      console.error("Task Reward Error:", err);
      throw err;
    }
  }
}

export const gamificationService = new GamificationService();
