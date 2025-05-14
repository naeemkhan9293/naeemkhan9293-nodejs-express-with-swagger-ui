/**
 * Base error class for application errors
 */
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  logLevel: string;
  timestamp: string;
  code?: string;
  errors?: any;
  value?: string;

  constructor(message: string, statusCode: number, isOperational = true, logLevel = "error") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.logLevel = logLevel;
    this.timestamp = new Date().toISOString();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  // Method to categorize error type
  getErrorType() {
    if (this.statusCode >= 500) return "Server Error";
    if (this.statusCode >= 400) return "Client Error";
    return "Unknown Error";
  }
}

/**
 * Not Found Error - 404
 */
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, true, "warn");
  }
}

/**
 * Validation Error - 400
 */
class ValidationError extends AppError {
  constructor(message = "Validation failed", errors?: any) {
    super(message, 400, true, "warn");
    if (errors) this.errors = errors;
  }
}

/**
 * Unauthorized Error - 401
 */
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401, true, "warn");
  }
}

/**
 * Internal Server Error - 500
 */
class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, true, "error");
  }
}

/**
 * Business Logic Error - 422
 */
class BusinessLogicError extends AppError {
  constructor(message = "Business rule violation") {
    super(message, 422, true, "warn");
  }
}

/**
 * Route Not Found Error - 404
 */
class RouteNotFoundError extends AppError {
  constructor(message = "Route not found") {
    super(message, 404, true, "warn");
  }
}

/**
 * File Upload Error - 500
 */
class FileUploadError extends AppError {
  constructor(message = "File upload failed") {
    super(message, 500, true, "error");
  }
}

/**
 * File Size Limit Exceeded Error - 413
 */
class FileSizeLimitExceededError extends AppError {
  constructor(message = "File size exceeds the allowed limit of 1 MB") {
    super(message, 413, true, "warn");
  }
}

/**
 * Authentication Error - 401
 */
class AuthenticationError extends AppError {
  constructor(message = "Authentication failed", statusCode = 401) {
    super(message, statusCode, true, "warn");
  }
}

/**
 * Login Error - 401
 */
class LoginError extends AppError {
  constructor(message = "Invalid Email or Password") {
    super(message, 401, true, "warn");
  }
}

/**
 * Unsupported File Type Error - 415
 */
class UnsupportedFileTypeError extends AppError {
  constructor(message = "Unsupported file format") {
    super(message, 415, true, "warn");
  }
}

/**
 * Bad Request Error - 400
 */
class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, true, "warn");
  }
}

/**
 * Forbidden Error - 403
 */
class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, true, "warn");
  }
}

/**
 * Verification Error - 400
 * Specialized error for account verification failures
 */
class VerificationError extends AppError {
  constructor(message = "Verification failed", details?: any) {
    super(message, 400, true, "warn");
    if (details) this.errors = details;
  }
}

/**
 * Error type checking functions
 */
export const errorCheckers = {
  /**
   * Check if error is an AppError
   */
  isAppError: (err: any): err is AppError => {
    return err instanceof AppError;
  },

  /**
   * Check if error is a validation error
   */
  isValidationError: (err: any): boolean => {
    return (
      err instanceof ValidationError ||
      err.name === "ValidationError" ||
      err.code === "VALIDATION_ERROR"
    );
  },

  /**
   * Check if error is a duplicate key error
   */
  isDuplicateKeyError: (err: any): boolean => {
    return err.code === 11000 || err.code === 11001 || err.code === "DUPLICATE_KEY";
  },

  /**
   * Check if error is a cast error
   */
  isCastError: (err: any): boolean => {
    return err.name === "CastError" || err.code === "CAST_ERROR";
  },

  /**
   * Check if error is a not found error
   */
  isNotFoundError: (err: any): boolean => {
    return (
      err instanceof NotFoundError ||
      err instanceof RouteNotFoundError ||
      err.statusCode === 404 ||
      err.code === "NOT_FOUND"
    );
  },

  /**
   * Check if error is a server error
   */
  isServerError: (err: any): boolean => {
    return !err.isOperational || err.statusCode >= 500;
  },

  /**
   * Check if error is an authentication error
   */
  isAuthError: (err: any): boolean => {
    return (
      err instanceof UnauthorizedError ||
      err instanceof AuthenticationError ||
      err instanceof LoginError ||
      err.statusCode === 401 ||
      err.code === "UNAUTHORIZED"
    );
  },
};

export {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  InternalServerError,
  BusinessLogicError,
  RouteNotFoundError,
  FileUploadError,
  FileSizeLimitExceededError,
  AuthenticationError,
  LoginError,
  UnsupportedFileTypeError,
  BadRequestError,
  ForbiddenError,
  VerificationError,
};
