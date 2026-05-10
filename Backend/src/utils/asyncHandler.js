/**
 * Async Handler Wrapper
 * Wraps async express routes to catch errors and pass them to the global error handler.
 * Eliminates the need for repetitive try-catch blocks in controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
