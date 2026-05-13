import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    deadline: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    xpReward: {
      type: Number,
      default: 10,
    },

    penalty: {
      type: Number,
      default: 5,
    },

    deadlinePenaltyAppliedAt: {
      type: Date,
    },

    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval by user and filtering by status/date
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });

const taskModel = mongoose.model("Task", taskSchema);

export default taskModel;
