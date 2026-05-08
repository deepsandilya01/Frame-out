import taskModel from "../models/task.model.js";

// ---------------------------------------------------------------------------
// POST /api/tasks/create
// ---------------------------------------------------------------------------
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, deadline, tags } = req.body;

    const task = await taskModel.create({
      user: req.user._id,
      title,
      description,
      priority,
      status,
      deadline,
      tags,
    });

    return res.status(201).json({
      message: "Task created successfully",
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// GET /api/tasks/view   (only the logged-in user's tasks)
// Query: ?status=pending&priority=high&page=1&limit=10
// ---------------------------------------------------------------------------
export const viewTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const tasks = await taskModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await taskModel.countDocuments(filter);

    return res.status(200).json({
      message: "Tasks fetched successfully",
      success: true,
      tasks,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/tasks/update/:id
// ---------------------------------------------------------------------------
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, deadline, tags } = req.body;

    const task = await taskModel.findOneAndUpdate(
      { _id: id, user: req.user._id },   // ownership check
      { title, description, priority, status, deadline, tags },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found", success: false });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/tasks/delete/:id
// ---------------------------------------------------------------------------
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskModel.findOneAndDelete({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found", success: false });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id/status
// ---------------------------------------------------------------------------
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await taskModel.findOneAndUpdate(
      { _id: id, user: req.user._id },   // ownership check
      {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found", success: false });
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};