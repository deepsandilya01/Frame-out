import taskModel from "../models/task.model.js";
import { gamificationService } from "../services/gamification.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all tasks
// @route   GET /api/tasks/view
export const viewTasks = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;
  const query = { user: req.user._id };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: "i" };

  const tasks = await taskModel.find(query).sort({ createdAt: -1 }).lean();

  res.status(200).json({
    message: "Tasks retrieved successfully",
    success: true,
    tasks,
  });
});

// @desc    Create a task
// @route   POST /api/tasks/create
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, deadline, tags } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required", success: false });
  }

  const task = await taskModel.create({
    user: req.user._id,
    title,
    description,
    priority,
    deadline,
    tags,
  });

  res.status(201).json({
    message: "Task created successfully",
    success: true,
    task,
  });
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await taskModel.findOne({ _id: id, user: req.user._id }).lean();

  if (!task) {
    return res.status(404).json({ message: "Task not found", success: false });
  }

  res.status(200).json({
    message: "Task retrieved successfully",
    success: true,
    task,
  });
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "in-progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status", success: false });
  }

  const task = await taskModel.findOne({ _id: id, user: req.user._id });

  if (!task) {
    return res.status(404).json({ message: "Task not found", success: false });
  }

  const oldStatus = task.status;
  task.status = status;

  let gamification = null;
  if (status === "completed" && oldStatus !== "completed") {
    task.completedAt = new Date();
    // Award XP via Service using task's specific reward
    const result = await gamificationService.awardTaskRewards(req.user._id, task.xpReward);
    gamification = {
      xpGained: task.xpReward,
      level: result.stats.level,
      leveledUp: result.leveled,
      newBadges: result.newBadges,
    };
  }

  await task.save();

  res.status(200).json({
    message: "Task status updated successfully",
    success: true,
    task,
    gamification,
  });
});

// @desc    Update task details
// @route   PUT /api/tasks/update/:id
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await taskModel.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ message: "Task not found", success: false });
  }

  res.status(200).json({
    message: "Task updated successfully",
    success: true,
    task,
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/delete/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await taskModel.findOneAndDelete({ _id: id, user: req.user._id });

  if (!task) {
    return res.status(404).json({ message: "Task not found", success: false });
  }

  res.status(200).json({
    message: "Task deleted successfully",
    success: true,
  });
});