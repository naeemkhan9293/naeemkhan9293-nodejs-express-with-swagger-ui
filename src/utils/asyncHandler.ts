import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Asynchronous error handler for Express middleware
 *
 * This function wraps an asynchronous Express middleware function and handles any errors
 * that occur during its execution. It ensures that errors are properly passed to Express's
 * error handling mechanism.
 *
 * @param {Function} fn - The asynchronous middleware function to be wrapped
 * @returns {Function} A new middleware function that handles errors
 *
 * @example
 * app.get('/example', asyncHandler(async (req, res) => {
 *   // Your asynchronous code here
 * }));
 */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

export default asyncHandler;
