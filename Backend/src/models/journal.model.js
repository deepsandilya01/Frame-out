import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    content: {
      type: String,
      default: "",
      maxlength: 5000,
    },
    mood: {
      type: String,
      enum: ["sleepy", "calm", "happy", "motivated", "energized"],
      default: null,
    },
    goals: [{ type: String, maxlength: 200 }],
    gratitude: [{ type: String, maxlength: 200 }],
    highlights: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One entry per user per day
journalSchema.index({ user: 1, date: 1 }, { unique: true });

const JournalModel = mongoose.model("Journal", journalSchema);
export default JournalModel;
