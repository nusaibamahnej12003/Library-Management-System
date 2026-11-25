const { AppError, ValidationError, InternalServerError } = require("../utils/errors");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let problem;
  if (error instanceof AppError) {
    problem = error;
  } else if (error?.type === "entity.parse.failed") {
    problem = new ValidationError("Request body must contain valid JSON.");
  } else {
    console.error(`[${req.id}]`, error);
    problem = new InternalServerError();
  }

  res
    .status(problem.status)
    .type("application/problem+json")
    .json({
      type: problem.type,
      title: problem.title,
      status: problem.status,
      detail: problem.message,
      instance: req.originalUrl,
      requestId: req.id
    });
}

module.exports = errorHandler;
