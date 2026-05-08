import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    missions: [
      {
        title:       { type: String, required: true },
        description: { type: String, default: "" },
        xpReward:    { type: Number, default: 10 },
        difficulty:  { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
        category:    { type: String, default: "focus" },
        completed:   { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

missionSchema.index({ user: 1, date: 1 }, { unique: true });

const MissionModel = mongoose.model("Mission", missionSchema);
export default MissionModel;
