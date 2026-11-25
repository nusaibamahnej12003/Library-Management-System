const { ValidationError } = require("../utils/errors");
const Book = require("../domain/Book");

const bookFields = new Set(["title", "author", "isbn", "description", "totalCopies"]);

function requireObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }
}

function validateText(value, field, required) {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function validateBookCreate(body) {
  requireObject(body);
  const title = validateText(body.title, "title", true);
  const author = validateText(body.author, "author", true);
  const isbn = validateText(body.isbn, "isbn", true);
  const description = body.description === undefined ? null : body.description;

  if (description !== null && typeof description !== "string") {
    throw new ValidationError("description must be a string or null.");
  }

  const totalCopies = body.totalCopies === undefined ? 1 : body.totalCopies;
  const availableCopies = body.availableCopies === undefined ? totalCopies : body.availableCopies;
  Book.assertValidCopies(totalCopies, availableCopies);

  for (const field of Object.keys(body)) {
    if (!bookFields.has(field) && field !== "availableCopies") {
      throw new ValidationError(`Unknown book field: ${field}.`);
    }
  }

  return { title, author, isbn, description, totalCopies, availableCopies };
}

function validateBookUpdate(body) {
  requireObject(body);
  const keys = Object.keys(body);
  if (keys.length === 0) {
    throw new ValidationError("At least one updatable field is required.");
  }

  const update = {};
  for (const field of keys) {
    if (!bookFields.has(field)) {
      if (field === "availableCopies") {
        throw new ValidationError("availableCopies is managed by borrowing and returning operations.");
      }
      throw new ValidationError(`Unknown book field: ${field}.`);
    }

    if (field === "title" || field === "author" || field === "isbn") {
      update[field] = validateText(body[field], field, true);
    } else if (field === "description") {
      if (body.description !== null && typeof body.description !== "string") {
        throw new ValidationError("description must be a string or null.");
      }
      update.description = body.description;
    } else if (field === "totalCopies") {
      if (!Number.isInteger(body.totalCopies) || body.totalCopies < 0 || body.totalCopies > 2147483647) {
        throw new ValidationError("totalCopies must be a non-negative 32-bit integer.");
      }
      update.totalCopies = body.totalCopies;
    }
  }
  return update;
}

module.exports = { validateBookCreate, validateBookUpdate };
