import HeatmapModel from "../models/heatmap.model.js";
import focusSessionModel from "../models/focussession.model.js";
import taskModel from "../models/task.model.js";

// ---------------------------------------------------------------------------
// Helper: today's date as "YYYY-MM-DD"
// ---------------------------------------------------------------------------
function toDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Helper: build a complete 365-day grid (filled with level=0 for missing days)
// so the frontend can render every cell without gaps
// ---------------------------------------------------------------------------
function buildYearGrid(snapshots, fromDate) {
  // Map existing data by date string
  const dataMap = {};
  snapshots.forEach((s) => {
    dataMap[s.date] = s;
  });

  const grid = [];
  const cursor = new Date(fromDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  while (cursor <= today) {
    const key = toDateString(cursor);
    grid.push(
      dataMap[key]
        ? {
            date: key,
            focusMinutes:      dataMap[key].focusMinutes,
            sessionsCompleted: dataMap[key].sessionsCompleted,
            tasksCompleted:    dataMap[key].tasksCompleted,
            distractions:      dataMap[key].distractions,
            level:             dataMap[key].level,
          }
        : { date: key, focusMinutes: 0, sessionsCompleted: 0, tasksCompleted: 0, distractions: 0, level: 0 }
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return grid;
}

// ---------------------------------------------------------------------------
// POST /api/heatmap/sync
// Rebuilds today's heatmap cell from raw focus + task data.
// Call this from your focus-session /end handler.
// ---------------------------------------------------------------------------
export const syncHeatmap = async (req, res) => {
  try {
    const userId  = req.user._id;
    const todayStr = toDateString();

    // Midnight range for today
    const start = new Date(`${todayStr}T00:00:00.000Z`);
    const end   = new Date(`${todayStr}T23:59:59.999Z`);

    // Aggregate today's focus sessions
    const [focusAgg] = await focusSessionModel.aggregate([
      { $match: { user: userId, startedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          focusMinutes:      { $sum: "$duration" },
          sessionsCompleted: { $sum: { $cond: ["$completed", 1, 0] } },
          distractions:      { $sum: "$distractions" },
        },
      },
    ]);

    // Count tasks completed today
    const tasksCompleted = await taskModel.countDocuments({
      user: userId,
      status: "completed",
      updatedAt: { $gte: start, $lte: end },
    });

    const focusMinutes      = focusAgg?.focusMinutes      || 0;
    const sessionsCompleted = focusAgg?.sessionsCompleted || 0;
    const distractions      = focusAgg?.distractions      || 0;

    const cell = await HeatmapModel.findOneAndUpdate(
      { user: userId, date: todayStr },
      {
        $set: {
          focusMinutes,
          sessionsCompleted,
          tasksCompleted,
          distractions,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Heatmap synced",
      success: true,
      cell,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/heatmap/year
// Returns a full 365-day grid (last 52 weeks) — exactly like GitHub
// ---------------------------------------------------------------------------
export const getYearHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;

    // Start from 364 days ago (365 total including today)
    const from = new Date();
    from.setDate(from.getDate() - 364);
    from.setHours(0, 0, 0, 0);
    const fromStr = toDateString(from);

    const snapshots = await HeatmapModel.find({
      user: userId,
      date: { $gte: fromStr },
    }).select("date focusMinutes sessionsCompleted tasksCompleted distractions level").lean();

    const grid = buildYearGrid(snapshots, from);

    // Summary stats
    const totalFocusMinutes  = grid.reduce((a, d) => a + d.focusMinutes, 0);
    const totalActiveDays    = grid.filter((d) => d.level > 0).length;
    const longestStreak      = calcLongestStreak(grid);
    const currentStreak      = calcCurrentStreak(grid);

    return res.status(200).json({
      message: "Year heatmap fetched",
      success: true,
      grid,          // 365 cells [{date, focusMinutes, level, ...}]
      summary: {
        totalFocusMinutes,
        totalActiveDays,
        longestStreak,
        currentStreak,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/heatmap/range?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns heatmap data for a custom date range
// ---------------------------------------------------------------------------
export const getRangeHeatmap = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "from and to query params are required", success: false });
    }

    const fromDate = new Date(from);
    const toDate   = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD", success: false });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ message: "'from' must be before 'to'", success: false });
    }

    const snapshots = await HeatmapModel.find({
      user: req.user._id,
      date: { $gte: from, $lte: to },
    }).select("date focusMinutes sessionsCompleted tasksCompleted distractions level").lean();

    const grid = buildYearGrid(snapshots, fromDate);

    return res.status(200).json({
      message: "Range heatmap fetched",
      success: true,
      grid,
      range: { from, to },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/heatmap/today
// Returns today's single cell
// ---------------------------------------------------------------------------
export const getTodayCell = async (req, res) => {
  try {
    const todayStr = toDateString();

    const cell = await HeatmapModel.findOne({
      user: req.user._id,
      date: todayStr,
    });

    return res.status(200).json({
      message: "Today's heatmap cell fetched",
      success: true,
      cell: cell || { date: todayStr, focusMinutes: 0, sessionsCompleted: 0, tasksCompleted: 0, distractions: 0, level: 0 },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// Streak helpers
// ---------------------------------------------------------------------------
function calcLongestStreak(grid) {
  let max = 0, curr = 0;
  for (const day of grid) {
    if (day.level > 0) { curr++; max = Math.max(max, curr); }
    else curr = 0;
  }
  return max;
}

function calcCurrentStreak(grid) {
  let streak = 0;
  // Walk backwards from today
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid[i].level > 0) streak++;
    else break;
  }
  return streak;
}
