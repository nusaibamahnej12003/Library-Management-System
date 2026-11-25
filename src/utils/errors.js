class AppError extends Error {
  constructor(message, status, type, title) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.type = type;
    this.title = title;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "https://library-management.local/problems/validation-error", "Bad Request");
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, "https://library-management.local/problems/not-found", "Not Found");
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "https://library-management.local/problems/conflict", "Conflict");
  }
}

class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred.") {
    super(message, 500, "https://library-management.local/problems/internal-server-error", "Internal Server Error");
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError
};
