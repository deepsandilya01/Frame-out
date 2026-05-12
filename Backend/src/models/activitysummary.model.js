import mongoose from "mongoose";

const WebsiteActivitySchema = new mongoose.Schema({
  website: { type: String, required: true },
  duration: { type: Number, default: 0 }, // in seconds
  visits: { type: Number, default: 0 },
  category: { 
    type: String, 
    enum: ["Productive", "Distracting", "Neutral"], 
    default: "Neutral" 
  }
});

const ActivitySummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  totalScreenTime: { type: Number, default: 0 }, // in seconds
  productiveTime: { type: Number, default: 0 },
  distractingTime: { type: Number, default: 0 },
  neutralTime: { type: Number, default: 0 },
  websites: [WebsiteActivitySchema]
}, { timestamps: true });

ActivitySummarySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("ActivitySummary", ActivitySummarySchema);
