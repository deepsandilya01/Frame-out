import asyncHandler from "../utils/asyncHandler.js";
import ActivitySummary from "../models/activitysummary.model.js";

// Basic categorizer
const categorizeWebsite = (domain) => {
  const lowerDomain = domain.toLowerCase();
  
  // Productive
  if (lowerDomain.includes("github.com") || lowerDomain.includes("vscode") || 
      lowerDomain.includes("chatgpt.com") || lowerDomain.includes("notion.so") || 
      lowerDomain.includes("docs.google.com") || lowerDomain.includes("coursera.org") || 
      lowerDomain.includes("leetcode.com")) {
    return "Productive";
  }
  
  // Distracting
  if (lowerDomain.includes("instagram.com") || lowerDomain.includes("facebook.com") || 
      lowerDomain.includes("reddit.com") || lowerDomain.includes("netflix.com") || 
      lowerDomain.includes("twitter.com") || lowerDomain.includes("x.com")) {
    return "Distracting";
  }
  
  // Neutral
  if (lowerDomain.includes("google.com") || lowerDomain.includes("gmail.com") || 
      lowerDomain.includes("linkedin.com")) {
    return "Neutral";
  }

  return "Neutral";
};

// @desc    Sync extension activity to backend
// @route   POST /api/analytics/sync-extension
export const syncExtensionActivity = asyncHandler(async (req, res) => {
  const { activities } = req.body;
  if (!activities || !Array.isArray(activities)) {
    return res.status(400).json({ message: "Invalid activities format", success: false });
  }

  const today = new Date().toISOString().split('T')[0];
  const userId = req.user._id;

  // Find or create today's summary
  let summary = await ActivitySummary.findOne({ user: userId, date: today });
  if (!summary) {
    summary = new ActivitySummary({
      user: userId,
      date: today,
      websites: []
    });
  }

  // Update logic
  for (const act of activities) {
    const existingIdx = summary.websites.findIndex(w => w.website === act.website);
    if (existingIdx >= 0) {
      summary.websites[existingIdx].duration += act.duration;
      summary.websites[existingIdx].visits += act.visits;
    } else {
      summary.websites.push({
        website: act.website,
        duration: act.duration,
        visits: act.visits,
        category: categorizeWebsite(act.website)
      });
    }
  }

  // Recalculate totals
  let total = 0, prod = 0, dist = 0, neut = 0;
  summary.websites.forEach(w => {
    total += w.duration;
    if (w.category === "Productive") prod += w.duration;
    else if (w.category === "Distracting") dist += w.duration;
    else neut += w.duration;
  });

  summary.totalScreenTime = total;
  summary.productiveTime = prod;
  summary.distractingTime = dist;
  summary.neutralTime = neut;

  await summary.save();

  res.status(200).json({ success: true, message: "Activity synced" });
});

// @desc    Get activity dashboard stats
// @route   GET /api/analytics/activity-stats
export const getActivityStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split('T')[0];
  
  const summary = await ActivitySummary.findOne({ user: userId, date: today });
  
  // Weekly aggregation
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekDateStr = weekStart.toISOString().split('T')[0];
  
  const weekData = await ActivitySummary.find({ 
    user: userId, 
    date: { $gte: weekDateStr } 
  }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    data: {
      today: summary || {
        totalScreenTime: 0,
        productiveTime: 0,
        distractingTime: 0,
        neutralTime: 0,
        websites: []
      },
      week: weekData
    }
  });
});
