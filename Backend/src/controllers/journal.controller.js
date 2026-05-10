import JournalModel from "../models/journal.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const todayStr = () => new Date().toISOString().split("T")[0];

// @desc    Get or create today's journal entry
// @route   GET /api/journal/today
export const getTodayEntry = asyncHandler(async (req, res) => {
  const today = todayStr();
  let entry = await JournalModel.findOne({ user: req.user._id, date: today });
  
  if (!entry) {
    entry = await JournalModel.create({ user: req.user._id, date: today });
  }
  
  res.status(200).json({ success: true, entry });
});

// @desc    Upsert today's journal entry
// @route   PUT /api/journal/today
export const upsertTodayEntry = asyncHandler(async (req, res) => {
  const today = todayStr();
  const { content, mood, goals, gratitude, highlights } = req.body || {};

  const update = {};
  if (content    !== undefined) update.content    = content;
  if (mood       !== undefined) update.mood       = mood;
  if (goals      !== undefined) update.goals      = goals;
  if (gratitude  !== undefined) update.gratitude  = gratitude;
  if (highlights !== undefined) update.highlights = highlights;

  const entry = await JournalModel.findOneAndUpdate(
    { user: req.user._id, date: today },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, message: "Journal saved", entry });
});

// @desc    Get paginated past journal entries
// @route   GET /api/journal/history
export const getHistory = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);
  const skip  = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    JournalModel.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JournalModel.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    entries,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a specific day's entry
// @route   GET /api/journal/:date
export const getEntryByDate = asyncHandler(async (req, res) => {
  const entry = await JournalModel.findOne({
    user: req.user._id,
    date: req.params.date,
  }).lean();

  if (!entry) {
    return res.status(404).json({ success: false, message: "No entry for this date" });
  }
  
  res.status(200).json({ success: true, entry });
});
