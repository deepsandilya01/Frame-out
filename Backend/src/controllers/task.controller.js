import taskModel from "../models/task.model.js";
import { gamificationService } from "../services/gamification.service.js";
import asyncHandler from "../utils/asyncHandler.js";

const isPastDeadline = (deadline) => {
  if (!deadline) return false;

  const dueDate = new Date(deadline);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
};

const didMissDeadline = (task) => {
  if (!task?.deadline) return false;

  const dueDate = new Date(task.deadline);
  if (Number.isNaN(dueDate.getTime())) return false;
  dueDate.setHours(0, 0, 0, 0);

  if (task.status === "completed") {
    if (!task.completedAt) return false;
    const completedAt = new Date(task.completedAt);
    if (Number.isNaN(completedAt.getTime())) return false;
    completedAt.setHours(0, 0, 0, 0);
    return dueDate < completedAt;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
};


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

    if (isPastDeadline(task.deadline)) {
      if (!task.deadlinePenaltyAppliedAt) {
        const penaltyAmt = task.penalty || 5;
        const result = await gamificationService.applyTaskPenalty(
          req.user._id,
          penaltyAmt,
          "DEADLINE_MISSED"
        );
        task.deadlinePenaltyAppliedAt = new Date();
        gamification = {
          xpLost: penaltyAmt,
          level: result.stats.level,
          reason: "Missed task deadline",
        };
      }
    } else {
      // Award XP via Service using task's specific reward
      const result = await gamificationService.awardTaskRewards(req.user._id, task.xpReward);
      gamification = {
        xpGained: task.xpReward,
        level: result.stats.level,
        leveledUp: result.leveled,
        newBadges: result.newBadges,
      };
    }
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

// @desc    Delete task  (applies penalty if task was NOT completed)
// @route   DELETE /api/tasks/delete/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await taskModel.findOneAndDelete({ _id: id, user: req.user._id });

  if (!task) {
    return res.status(404).json({ message: "Task not found", success: false });
  }

  // Apply penalty only when a non-completed task is deleted
  let gamification = null;
  if (task.status !== "completed") {
    const penaltyAmt = task.penalty || 5;
    const result = await gamificationService.applyTaskPenalty(
      req.user._id,
      penaltyAmt,
      "TASK_DELETED"
    );
    gamification = {
      xpLost: penaltyAmt,
      level: result.stats.level,
      reason: "Task deleted before completion",
    };
  }

  res.status(200).json({
    message: "Task deleted successfully",
    success: true,
    gamification,
  });
});

// @desc    Apply penalty for a missed deadline task
// @route   PATCH /api/tasks/:id/miss-deadline
export const missDeadlinePenalty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await taskModel.findOne({ _id: id, user: req.user._id });

  if (!task) {
    return res.status(404).json({ message: "Task not found", success: false });
  }

  if (!didMissDeadline(task)) {
    return res.status(400).json({ message: "Task deadline has not been missed", success: false });
  }

  if (task.deadlinePenaltyAppliedAt) {
    return res.status(200).json({
      message: "Deadline penalty already applied",
      success: true,
      task,
      gamification: null,
    });
  }

  const appliedAt = new Date();
  const markedTask = await taskModel.findOneAndUpdate(
    {
      _id: id,
      user: req.user._id,
      $or: [
        { deadlinePenaltyAppliedAt: { $exists: false } },
        { deadlinePenaltyAppliedAt: null },
      ],
    },
    { $set: { deadlinePenaltyAppliedAt: appliedAt } },
    { new: true }
  );

  if (!markedTask) {
    const latestTask = await taskModel.findOne({ _id: id, user: req.user._id });
    return res.status(200).json({
      message: "Deadline penalty already applied",
      success: true,
      task: latestTask,
      gamification: null,
    });
  }

  const penaltyAmt = markedTask.penalty || 5;
  let result;
  try {
    result = await gamificationService.applyTaskPenalty(
      req.user._id,
      penaltyAmt,
      "DEADLINE_MISSED"
    );
  } catch (err) {
    await taskModel.updateOne(
      { _id: id, user: req.user._id, deadlinePenaltyAppliedAt: appliedAt },
      { $unset: { deadlinePenaltyAppliedAt: "" } }
    );
    throw err;
  }

  res.status(200).json({
    message: "Deadline penalty applied",
    success: true,
    task: markedTask,
    gamification: {
      xpLost: penaltyAmt,
      level: result.stats.level,
      reason: "Missed task deadline",
    },
  });
});
