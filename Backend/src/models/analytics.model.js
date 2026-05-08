import mongoose from "mongoose";

// Daily snapshot — one document per user per day
const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Date of this snapshot (stored as midnight UTC for easy grouping)
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // ---- Focus ----
    totalFocusMinutes: {
      type: Number,
      default: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },

    // ---- Tasks ----
    tasksCreated: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },

    // ---- Distractions ----
    distractionsCount: {
      type: Number,
      default: 0,
    },

    // ---- Scores (0–100) ----
    // productivityScore = (completedSessions / totalSessions) * 100
    productivityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // dopamineScore = reward points based on focus + tasks completed
    dopamineScore: {
      type: Number,
      default: 100,
      min: 0,
    },

    // ---- Streak on this day ----
    streakOnDay: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index — one snapshot per user per day
analyticsSchema.index({ user: 1, date: 1 }, { unique: true });

const AnalyticsModel = mongoose.model("Analytics", analyticsSchema);

export default AnalyticsModel;