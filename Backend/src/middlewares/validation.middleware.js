import { validationResult } from "express-validator";

/**
 * Factory: wraps an array of express-validator rules + error handler into one
 * middleware array that can be spread into a route definition.
 *
 * Usage:
 *   router.post("/create", authenticateUser, validationMiddleware(createTaskValidator), createTask);
 */
export const validationMiddleware = (validatorArray) => {
  if (!Array.isArray(validatorArray)) {
    throw new Error("validationMiddleware expects an array of express-validator rules");
  }
  return [...validatorArray, handleValidationErrors];
};

/**
 * Can also be used as a standalone middleware AFTER inline validators:
 *   router.post("/create", authenticateUser, ...createTaskValidator, handleValidationErrors, createTask)
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
