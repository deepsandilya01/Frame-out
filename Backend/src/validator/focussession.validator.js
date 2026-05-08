import { body, check, validationResult } from "express-validator";

// Shared error handler middleware
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }
  next();
}

// POST /api/focus/start
export const validateStartSession = [
  body("timerType")
    .optional()
    .isIn(["pomodoro", "custom"])
    .withMessage("timerType must be 'pomodoro' or 'custom'"),

  body("focusDuration")
    .if(body("timerType").equals("custom"))
    .notEmpty().withMessage("focusDuration is required for custom timer")
    .isInt({ min: 1, max: 180 }).withMessage("focusDuration must be between 1 and 180 minutes"),

  body("breakDuration")
    .optional()
    .isInt({ min: 1, max: 60 }).withMessage("breakDuration must be between 1 and 60 minutes"),

  body("mode")
    .optional()
    .isIn(["pomodoro", "deep-work"])
    .withMessage("mode must be 'pomodoro' or 'deep-work'"),

  body("mood")
    .optional()
    .isIn(["happy", "tired", "stressed", "motivated", "calm"])
    .withMessage("Invalid mood value"),

  handleValidationErrors,
];

// POST /api/focus/end
export const validateEndSession = [
  body("sessionId")
    .notEmpty().withMessage("sessionId is required")
    .isMongoId().withMessage("sessionId must be a valid MongoDB ID"),

  body("distractions")
    .optional()
    .isInt({ min: 0 }).withMessage("distractions must be a non-negative integer"),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes must be at most 500 characters"),

  body("mood")
    .optional()
    .isIn(["happy", "tired", "stressed", "motivated", "calm"])
    .withMessage("Invalid mood value"),

  body("completed")
    .optional()
    .isBoolean().withMessage("completed must be a boolean"),

  handleValidationErrors,
];
