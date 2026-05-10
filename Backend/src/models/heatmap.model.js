import mongoose from "mongoose";

/**
 * GitHub-style Activity Heatmap
 * One document per user per day.
 */
const heatmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    focusMinutes: {
      type: Number,
      default: 0,
    },

    sessionsCompleted: {
      type: Number,
      default: 0,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
    },

    distractions: {
      type: Number,
      default: 0,
    },

    wasActive: {
      type: Boolean,
      default: false,
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

// Indexes
heatmapSchema.index({ user: 1, date: 1 }, { unique: true });
heatmapSchema.index({ user: 1, wasActive: 1 });

// Auto-compute level
heatmapSchema.pre("save", function () {
  this.level = computeLevel(this.focusMinutes);
});

heatmapSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  const mins = update?.$set?.focusMinutes ?? update?.focusMinutes;
  if (mins !== undefined) {
    const level = computeLevel(mins);
    if (update.$set) update.$set.level = level;
    else update.level = level;
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