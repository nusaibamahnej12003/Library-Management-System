const { ConflictError, ValidationError } = require("../utils/errors");

class Book {
  constructor({ totalCopies, availableCopies }) {
    this.totalCopies = totalCopies;
    this.availableCopies = availableCopies;
  }

  assertCanBorrow() {
    if (this.availableCopies <= 0) {
      throw new ConflictError("No copies of this book are currently available.");
    }
  }

  static assertCanDelete(activeBorrowings) {
    if (activeBorrowings > 0) {
      throw new ConflictError("A book with active borrowings cannot be deleted.");
    }
  }

  static assertValidCopies(totalCopies, availableCopies) {
    if (!Number.isInteger(totalCopies) || totalCopies < 0 || totalCopies > 2147483647) {
      throw new ValidationError("totalCopies must be a non-negative 32-bit integer.");
    }
    if (!Number.isInteger(availableCopies) || availableCopies < 0 || availableCopies > 2147483647) {
      throw new ValidationError("availableCopies must be a non-negative 32-bit integer.");
    }
    if (availableCopies > totalCopies) {
      throw new ValidationError("availableCopies cannot exceed totalCopies.");
    }
  }
}

module.exports = Book;
