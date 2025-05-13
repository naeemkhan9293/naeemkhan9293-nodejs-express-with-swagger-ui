import { logger } from "#src/config/logger";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import {
  errorCheckers,
  ValidationError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "#src/error/AppError";

interface ErrorResponse extends Error {
  statusCode?: number;
  code?: number | string;
  value?: string;
  errors?: any;
  isOperational?: boolean;
  logLevel?: string;
  timestamp?: string;
}

/**
 * Format error response based on error type
 */
const formatErrorResponse = (err: ErrorResponse) => {
  const response: any = {
    success: false,
    message: err.message || "Something went wrong",
    statusCode: err.statusCode || 500,
  };

  // Add error code if available
  if (err.code) {
    response.code = err.code;
  }

  // Add validation errors if available
  if (err.errors) {
    response.errors = err.errors;
  }

  // Add value if available (for cast errors)
  if (err.value) {
    response.value = err.value;
  }

  // Add timestamp if available
  if (err.timestamp) {
    response.timestamp = err.timestamp;
  }

  return response;
};

/**
 * Handle different types of errors
 */
const handleSpecificErrors = (err: ErrorResponse): ErrorResponse => {
  let error = { ...err };
  error.message = err.message;

  // If it's already an AppError instance, return it as is
  if (errorCheckers.isAppError(err)) {
    return err;
  }

  // Handle Mongoose validation errors
  if (errorCheckers.isValidationError(err)) {
    return new ValidationError(err.message || "Validation failed", err.errors);
  }

  // Handle Mongoose duplicate key errors
  if (errorCheckers.isDuplicateKeyError(err)) {
    const field = Object.keys(err.errors || {})[0] || "field";
    return new BadRequestError(`Duplicate value for ${field}. Please use another value.`);
  }

  // Handle Mongoose cast errors
  if (errorCheckers.isCastError(err)) {
    return new BadRequestError(`Invalid ${err.value || "value"}: ${err.message}`);
  }

  // Handle not found errors
  if (errorCheckers.isNotFoundError(err)) {
    return new NotFoundError(err.message || "Resource not found");
  }

  // Default to internal server error for unhandled errors
  if (!error.statusCode) {
    return new InternalServerError(err.message || "Something went wrong");
  }

  return error;
};

/**
 * Global error handler middleware
 */
const errorHandler: ErrorRequestHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Process the error
  const error = handleSpecificErrors(err);

  // Determine log level (default to error)
  const logLevel = (error as any).logLevel || "error";

  // Log error with details using appropriate log level
  if (logLevel === "warn") {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`, {
      error,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
      statusCode: error.statusCode || 500,
    });
  } else {
    // Default to error level
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, {
      error,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
      statusCode: error.statusCode || 500,
    });
  }

  // Format the error response
  const response = formatErrorResponse(error);

  // Send response
  res.status(error.statusCode || 500).json(response);
};

export default errorHandler;
