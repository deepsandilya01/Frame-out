import userModel from "../models/user.model.js";
import focusSessionModel from "../models/focussession.model.js";
import taskModel from "../models/task.model.js";
import auditModel from "../models/audit.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get Platform-wide stats
// @route   GET /api/admin/stats
export const getPlatformStats = asyncHandler(async (req, res) => {
  // Ensure all users have a createdAt timestamp for the chart
  const allUsers = await userModel.find({ createdAt: { $exists: false } });
  if (allUsers.length > 0) {
    for (let i = 0; i < allUsers.length; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i % 7)); // Spread over last 7 days
      await userModel.findByIdAndUpdate(allUsers[i]._id, { $set: { createdAt: date } }, { timestamps: false });
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30); // Look back further to be safe

  const [userCount, sessionCount, taskCount, totalFocusRes, growthData] = await Promise.all([
    userModel.countDocuments(),
    focusSessionModel.countDocuments(),
    taskModel.countDocuments(),
    userModel.aggregate([{ $group: { _id: null, total: { $sum: "$totalFocusTime" } } }]),
    userModel.aggregate([
      { $match: { createdAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ])
  ]);

  const recentUsers = await userModel.find().sort({ createdAt: -1 }).limit(5).select("fullname email createdAt");

  res.status(200).json({
    success: true,
    stats: {
      users: userCount,
      sessions: sessionCount,
      tasks: taskCount,
      totalFocusMinutes: totalFocusRes[0]?.total || 0,
    },
    growth: growthData,
    recentUsers
  });
});

// @desc    Get Audit Logs
// @route   GET /api/admin/logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await auditModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('admin', 'fullname email');
  res.status(200).json({ success: true, logs });
});

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find().select("-password").sort({ createdAt: -1 });
  res.status(200).json({ success: true, users });
});

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role", success: false });
  }

  const user = await userModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found", success: false });

  // Log Action
  await auditModel.create({
    action: "Access Level Modified",
    details: `Role for ${user.fullname} changed to ${role.toUpperCase()}`,
    admin: req.user._id,
    target: user.fullname,
    type: "user_management"
  });

  res.status(200).json({ success: true, user });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await userModel.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found", success: false });

  await Promise.all([
    focusSessionModel.deleteMany({ user: req.params.id }),
    taskModel.deleteMany({ user: req.params.id })
  ]);

  // Log Action
  await auditModel.create({
    action: "Node Terminated",
    details: `User ${user.fullname} (${user.email}) removed from system`,
    admin: req.user._id,
    target: user.fullname,
    type: "security"
  });

  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// @desc    Assign task to a user
// @route   POST /api/admin/tasks/assign
export const assignTask = asyncHandler(async (req, res) => {
  const { userId, title, description, priority, deadline } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ message: "User ID and Title are required", success: false });
  }

  const user = await userModel.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found", success: false });

  const task = await taskModel.create({
    user: userId,
    title,
    description,
    priority: priority || "medium",
    deadline,
    xpReward: 20,
  });

  // Log Action
  await auditModel.create({
    action: "Directive Assigned",
    details: `Task "${title}" assigned to ${user.fullname}`,
    admin: req.user._id,
    target: user.fullname,
    type: "task_assignment"
  });

  res.status(201).json({ success: true, task });
});
