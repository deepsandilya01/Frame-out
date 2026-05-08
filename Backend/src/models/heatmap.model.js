import mongoose from "mongoose";

/**
 * GitHub-style Activity Heatmap
 * One document per user per day (stored as "YYYY-MM-DD" string for easy lookup).
 *
 * Level thresholds (like GitHub's 4-shade system):
 *   0 → no activity   (0 min)
 *   1 → light         (1–30 min)
 *   2 → moderate      (31–60 min)
 *   3 → high          (61–120 min)
 *   4 → intense       (121+ min)
 */
const heatmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      index: true,
    },

    focusMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    sessionsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    distractions: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one entry per user per day
heatmapSchema.index({ user: 1, date: 1 }, { unique: true });

// Auto-compute level before save
heatmapSchema.pre("save", function () {
  this.level = computeLevel(this.focusMinutes);
});

heatmapSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  const mins = update?.$set?.focusMinutes ?? update?.focusMinutes;
  if (mins !== undefined) {
    if (update.$set) update.$set.level = computeLevel(mins);
    else update.level = computeLevel(mins);
  }
});

function computeLevel(minutes) {
  if (minutes >= 121) return 4;
  if (minutes >= 61)  return 3;
  if (minutes >= 31)  return 2;
  if (minutes >= 1)   return 1;
  return 0;
}

const HeatmapModel = mongoose.model("Heatmap", heatmapSchema);
export default HeatmapModel;