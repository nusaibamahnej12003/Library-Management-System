const { ValidationError } = require("../utils/errors");

function validateBorrow(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }
  if (typeof body.borrowerName !== "string" || body.borrowerName.trim().length === 0) {
    throw new ValidationError("borrowerName must be a non-empty string.");
  }
  if (Object.keys(body).some((key) => key !== "borrowerName")) {
    throw new ValidationError("Only borrowerName is accepted.");
  }
  return { borrowerName: body.borrowerName.trim() };
}

function validateReturn(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }
  if (!Number.isInteger(body.borrowingId) || body.borrowingId <= 0 || body.borrowingId > 2147483647) {
    throw new ValidationError("borrowingId must be a positive 32-bit integer.");
  }
  if (Object.keys(body).some((key) => key !== "borrowingId")) {
    throw new ValidationError("Only borrowingId is accepted.");
  }
  return body.borrowingId;
}

module.exports = { validateBorrow, validateReturn };
