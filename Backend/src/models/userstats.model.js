import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// XP thresholds per level (level N requires this much total XP to reach)
// ---------------------------------------------------------------------------
export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  900,   // Level 5
  1400,  // Level 6
  2000,  // Level 7
  2800,  // Level 8
  3800,  // Level 9
  5000,  // Level 10
];

// ---------------------------------------------------------------------------
// XP reward values
// ---------------------------------------------------------------------------
export const XP_REWARDS = {
  SESSION_COMPLETED:   20,   // Completed a focus session
  SESSION_POMODORO:    10,   // Bonus for using Pomodoro mode
  TASK_COMPLETED:      15,   // Completed a task
  STREAK_BONUS:         5,   // Per active streak day (multiplied by streak count, max ×10)
  PERFECT_DAY:         50,   // Completed ≥ 4 sessions + ≥ 3 tasks in one day
  DISTRACTION_PENALTY: -2,   // Per distraction logged
};

// ---------------------------------------------------------------------------
// Badge definitions
// ---------------------------------------------------------------------------
export const BADGE_DEFINITIONS = {
  FIRST_SESSION:    { id: "FIRST_SESSION",    name: "First Focus",        desc: "Completed your first focus session",        icon: "🎯" },
  STREAK_3:         { id: "STREAK_3",         name: "On Fire",            desc: "Maintained a 3-day streak",                icon: "🔥" },
  STREAK_7:         { id: "STREAK_7",         name: "Week Warrior",       desc: "Maintained a 7-day streak",                icon: "⚡" },
  STREAK_30:        { id: "STREAK_30",        name: "Iron Discipline",    desc: "Maintained a 30-day streak",               icon: "🏆" },
  FOCUS_100:        { id: "FOCUS_100",        name: "Century Focus",      desc: "Accumulated 100 hours of focus time",      icon: "💯" },
  TASKS_10:         { id: "TASKS_10",         name: "Task Crusher",       desc: "Completed 10 tasks",                       icon: "✅" },
  TASKS_50:         { id: "TASKS_50",         name: "Productivity Beast", desc: "Completed 50 tasks",                       icon: "🚀" },
  PERFECT_DAY:      { id: "PERFECT_DAY",      name: "Perfect Day",        desc: "4+ sessions and 3+ tasks in one day",     icon: "⭐" },
  LEVEL_5:          { id: "LEVEL_5",          name: "Rising Star",        desc: "Reached Level 5",                          icon: "🌟" },
  LEVEL_10:         { id: "LEVEL_10",         name: "Master Mind",        desc: "Reached Level 10",                         icon: "👑" },
  NO_DISTRACTION:   { id: "NO_DISTRACTION",   name: "Deep Focus",         desc: "Completed a session with 0 distractions", icon: "🧘" },
  EARLY_BIRD:       { id: "EARLY_BIRD",       name: "Early Bird",         desc: "Started a session before 7AM",            icon: "🌅" },
};

// ---------------------------------------------------------------------------
// Badge sub-schema (stores earned date + metadata)
// ---------------------------------------------------------------------------
const badgeSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true },
    name:     { type: String, required: true },
    desc:     { type: String },
    icon:     { type: String },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// XP log entry (audit trail of how XP was earned/lost)
// ---------------------------------------------------------------------------
const xpLogSchema = new mongoose.Schema(
  {
    amount:    { type: Number, required: true },   // positive = earn, negative = penalty
    reason:    { type: String, required: true },   // e.g. "SESSION_COMPLETED"
    earnedAt:  { type: Date, default: Date.now },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Main UserStats schema
// ---------------------------------------------------------------------------
const userStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ---- XP & Level ----
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    // XP needed to reach the next level
    xpToNextLevel: {
      type: Number,
      default: LEVEL_THRESHOLDS[1], // 100
    },

    // ---- Streaks ----
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActiveDate: {
      type: String, // "YYYY-MM-DD"
      default: null,
    },

    // ---- Lifetime counters ----
    totalSessionsCompleted: {
      type: Number,
      default: 0,
    },

    totalTasksCompleted: {
      type: Number,
      default: 0,
    },

    totalFocusMinutes: {
      type: Number,
      default: 0,
    },

    totalDistractions: {
      type: Number,
      default: 0,
    },

    perfectDays: {
      type: Number,
      default: 0,
    },

    // ---- Badges ----
    badges: [badgeSchema],

    // ---- XP Audit log (last 100 entries) ----
    xpLog: {
      type: [xpLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Unique: one stats document per user
userStatsSchema.index({ user: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Instance method: add XP and auto-level-up
// ---------------------------------------------------------------------------
userStatsSchema.methods.addXP = function (amount, reason) {
  this.xp = Math.max(0, this.xp + amount);

  // Keep last 100 log entries
  this.xpLog.push({ amount, reason, earnedAt: new Date() });
  if (this.xpLog.length > 100) this.xpLog.shift();

  // Level-up check
  let leveled = false;
  while (
    this.level < LEVEL_THRESHOLDS.length &&
    this.xp >= LEVEL_THRESHOLDS[this.level] // index = next level threshold
  ) {
    this.level += 1;
    leveled = true;
  }

  // xpToNextLevel
  this.xpToNextLevel =
    this.level < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[this.level] - this.xp
      : 0; // max level

  return leveled;
};

// ---------------------------------------------------------------------------
// Instance method: award a badge (no-op if already earned)
// ---------------------------------------------------------------------------
userStatsSchema.methods.awardBadge = function (badgeId) {
  const already = this.badges.some((b) => b.id === badgeId);
  if (already) return false;

  const def = BADGE_DEFINITIONS[badgeId];
  if (!def) return false;

  this.badges.push({ ...def, earnedAt: new Date() });
  return true; // newly awarded
};

const UserStatsModel = mongoose.model("UserStats", userStatsSchema);
export default UserStatsModel;