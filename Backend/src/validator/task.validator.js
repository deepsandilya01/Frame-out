import { body } from "express-validator";

// POST /api/tasks/create
export const createTaskValidator = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

  body("description")
    .optional()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("priority")
    .optional()
    .isIn(["high", "medium", "low"]).withMessage("Priority must be high, medium, or low"),

  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"]).withMessage("Status must be pending, in-progress, or completed"),

  body("deadline")
    .optional()
    .isISO8601().withMessage("Deadline must be a valid ISO date (e.g. 2026-05-08)"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
];

// PUT /api/tasks/update/:id
export const updateTaskValidator = [
  body("title")
    .optional()
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

  body("description")
    .optional()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("priority")
    .optional()
    .isIn(["high", "medium", "low"]).withMessage("Priority must be high, medium, or low"),

  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"]).withMessage("Status must be pending, in-progress, or completed"),

  body("deadline")
    .optional()
    .isISO8601().withMessage("Deadline must be a valid ISO date"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
];

// PATCH /api/tasks/:id/status
export const updateTaskStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["pending", "in-progress", "completed"]).withMessage("Status must be pending, in-progress, or completed"),
];
