import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // "pomodoro" = 25min focus + 5min break  |  "custom" = user-defined times
    timerType: {
      type: String,
      enum: ["pomodoro", "custom"],
      default: "pomodoro",
    },

    // Focus duration in minutes
    focusDuration: {
      type: Number,
      default: 25, // Pomodoro default
    },

    // Break duration in minutes
    breakDuration: {
      type: Number,
      default: 5, // Pomodoro default
    },

    // Actual time focused (minutes) — filled on /end
    duration: {
      type: Number,
      default: 0,
    },

    // Which pomodoro round is this (1, 2, 3…)
    pomodoroRound: {
      type: Number,
      default: 1,
    },

    mode: {
      type: String,
      enum: ["pomodoro", "deep-work"],
      default: "pomodoro",
    },

    mood: {
      type: String,
      enum: ["happy", "tired", "stressed", "motivated", "calm"],
    },

    distractions: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false, // false until /end is called
    },

    notes: {
      type: String,
      default: "",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const focusSessionModel = mongoose.model("FocusSession", focusSessionSchema);
export default focusSessionModel;