import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} from "../validator/task.validator.js";
import {
  createTask,
  viewTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../controllers/task.controller.js";

const taskRouter = Router();

/**
 * @route   POST /api/tasks/create
 * @desc    Create a new task for the logged-in user
 * @access  Private
 */
taskRouter.post("/create", authenticateUser, validationMiddleware(createTaskValidator), createTask);

/**
 * @route   GET /api/tasks/view
 * @desc    Get all tasks for the logged-in user
 * @query   ?status=pending&priority=high&page=1&limit=20
 * @access  Private
 */
taskRouter.get("/view", authenticateUser, viewTasks);

/**
 * @route   PUT /api/tasks/update/:id
 * @desc    Update a task (must own the task)
 * @access  Private
 */
taskRouter.put("/update/:id", authenticateUser, validationMiddleware(updateTaskValidator), updateTask);

/**
 * @route   DELETE /api/tasks/delete/:id
 * @desc    Delete a task (must own the task)
 * @access  Private
 */
taskRouter.delete("/delete/:id", authenticateUser, deleteTask);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update only the status of a task
 * @body    { status: "pending" | "in-progress" | "completed" }
 * @access  Private
 */
taskRouter.patch("/:id/status", authenticateUser, validationMiddleware(updateTaskStatusValidator), updateTaskStatus);

export default taskRouter;