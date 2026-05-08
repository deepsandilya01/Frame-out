import JournalModel from "../models/journal.model.js";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// GET /api/journal/today
// Get or create today's journal entry
// ---------------------------------------------------------------------------
export const getTodayEntry = async (req, res) => {
  try {
    const today = todayStr();
    let entry = await JournalModel.findOne({ user: req.user._id, date: today });
    if (!entry) {
      entry = await JournalModel.create({ user: req.user._id, date: today });
    }
    return res.status(200).json({ success: true, entry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/journal/today
// Upsert today's journal entry
// Body: { content?, mood?, goals?, gratitude?, highlights? }
// ---------------------------------------------------------------------------
export const upsertTodayEntry = async (req, res) => {
  try {
    const today = todayStr();
    const { content, mood, goals, gratitude, highlights } = req.body || {};

    const update = {};
    if (content   !== undefined) update.content   = content;
    if (mood      !== undefined) update.mood       = mood;
    if (goals     !== undefined) update.goals      = goals;
    if (gratitude !== undefined) update.gratitude  = gratitude;
    if (highlights!== undefined) update.highlights = highlights;

    const entry = await JournalModel.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Journal saved", entry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/journal/history?page=1&limit=10
// Get paginated past journal entries
// ---------------------------------------------------------------------------
export const getHistory = async (req, res) => {
  try {
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

    return res.status(200).json({
      success: true,
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/journal/:date   ("YYYY-MM-DD")
// Get a specific day's entry
// ---------------------------------------------------------------------------
export const getEntryByDate = async (req, res) => {
  try {
    const entry = await JournalModel.findOne({
      user: req.user._id,
      date: req.params.date,
    });
    if (!entry) return res.status(404).json({ success: false, message: "No entry for this date" });
    return res.status(200).json({ success: true, entry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
