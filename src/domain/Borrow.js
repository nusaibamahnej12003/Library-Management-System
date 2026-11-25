const { ConflictError } = require("../utils/errors");

const BORROWED = "BORROWED";
const RETURNED = "RETURNED";

class Borrow {
  static assertCanReturn(borrowing) {
    if (borrowing.status !== BORROWED) {
      throw new ConflictError("This borrowing has already been returned.");
    }
    if (borrowing.bookId === null) {
      throw new ConflictError("The borrowed book is no longer available for return.");
    }
  }
}

Borrow.BORROWED = BORROWED;
Borrow.RETURNED = RETURNED;

module.exports = Borrow;
