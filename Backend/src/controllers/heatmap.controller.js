import HeatmapModel from "../models/heatmap.model.js";
import focusSessionModel from "../models/focussession.model.js";
import taskModel from "../models/task.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const toDateString = (date = new Date()) => date.toISOString().split("T")[0];

// @desc    Sync today's heatmap cell
// @route   POST /api/heatmap/sync
export const syncHeatmap = asyncHandler(async (req, res) => {
  const userId  = req.user._id;
  const todayStr = toDateString();

  const start = new Date(`${todayStr}T00:00:00.000Z`);
  const end   = new Date(`${todayStr}T23:59:59.999Z`);

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
        wasActive: true, // If we are syncing, they are active
      },
    },
    { upsert: true, new: true }
  );

  res.status(200).json({ success: true, cell });
});

// @desc    Get full year heatmap
// @route   GET /api/heatmap/year
export const getYearHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const from = new Date();
  from.setDate(from.getDate() - 364);
  from.setHours(0, 0, 0, 0);
  const fromStr = toDateString(from);

  const snapshots = await HeatmapModel.find({
    user: userId,
    date: { $gte: fromStr },
  }).lean();

  const grid = buildYearGrid(snapshots, from);

  // Summary stats
  const totalFocusMinutes = grid.reduce((a, d) => a + d.focusMinutes, 0);
  const totalActiveDays   = grid.filter((d) => d.wasActive || d.level > 0).length;
  
  res.status(200).json({
    success: true,
    grid,
    summary: {
      totalFocusMinutes,
      totalActiveDays,
      longestStreak: calcStreak(grid).max,
      currentStreak: calcStreak(grid).curr,
    },
  });
});

// @desc    Get heatmap for a specific date range
// @route   GET /api/heatmap/range
export const getRangeHeatmap = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const userId = req.user._id;

  if (!from || !to) {
    return res.status(400).json({ message: "Range parameters 'from' and 'to' are required", success: false });
  }

  const snapshots = await HeatmapModel.find({
    user: userId,
    date: { $gte: from, $lte: to },
  }).lean();

  res.status(200).json({ success: true, snapshots });
});

// @desc    Get today's heatmap cell details
// @route   GET /api/heatmap/today
export const getTodayCell = asyncHandler(async (req, res) => {
  const todayStr = toDateString();
  const cell = await HeatmapModel.findOne({ user: req.user._id, date: todayStr }).lean();

  res.status(200).json({
    success: true,
    cell: cell || {
      date: todayStr,
      focusMinutes: 0,
      sessionsCompleted: 0,
      tasksCompleted: 0,
      distractions: 0,
      level: 0,
      wasActive: false
    }
  });
});

// @desc    Mark today as active (without focus)
// @route   POST /api/heatmap/active
export const markActive = asyncHandler(async (req, res) => {
  const todayStr = toDateString();
  await HeatmapModel.findOneAndUpdate(
    { user: req.user._id, date: todayStr },
    { $set: { wasActive: true } },
    { upsert: true }
  );
  res.status(200).json({ success: true });
});

// ── Helpers ──

function buildYearGrid(snapshots, fromDate) {
  const dataMap = {};
  snapshots.forEach(s => dataMap[s.date] = s);

  const grid = [];
  const cursor = new Date(fromDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  while (cursor <= today) {
    const key = toDateString(cursor);
    const d = dataMap[key];
    grid.push({
      date: key,
      focusMinutes:      d?.focusMinutes || 0,
      sessionsCompleted: d?.sessionsCompleted || 0,
      tasksCompleted:    d?.tasksCompleted || 0,
      distractions:      d?.distractions || 0,
      level:             d?.level || 0,
      wasActive:         d?.wasActive || false,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return grid;
}

function calcStreak(grid) {
  let max = 0, curr = 0, last = 0;
  for (const day of grid) {
    if (day.level > 0 || day.wasActive) {
      last++;
      max = Math.max(max, last);
    } else {
      last = 0;
    }
  }
  // Current streak (walk back)
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid[i].level > 0 || grid[i].wasActive) curr++;
    else break;
  }
  return { max, curr };
}
