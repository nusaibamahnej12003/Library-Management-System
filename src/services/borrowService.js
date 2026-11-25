const Book = require("../domain/Book");
const Borrow = require("../domain/Borrow");
const { NotFoundError, ConflictError } = require("../utils/errors");

class BorrowService {
  constructor({ prisma, bookRepository, borrowRepository }) {
    this.prisma = prisma;
    this.bookRepository = bookRepository;
    this.borrowRepository = borrowRepository;
  }

  async borrow(bookId, borrowerName) {
    return this.prisma.$transaction(async (tx) => {
      const locked = await this.bookRepository.lockById(bookId, tx);
      if (locked.length === 0) throw new NotFoundError(`Book ${bookId} was not found.`);

      const book = await this.bookRepository.findById(bookId, tx);
      if (!book) throw new NotFoundError(`Book ${bookId} was not found.`);
      new Book(book).assertCanBorrow();

      const changed = await this.bookRepository.decrementAvailableCopies(bookId, tx);
      if (changed.count !== 1) {
        throw new ConflictError("No copies of this book are currently available.");
      }

      return this.borrowRepository.create({
        bookId,
        bookTitle: book.title,
        borrowerName,
        status: Borrow.BORROWED
      }, tx);
    });
  }

  async returnBorrowing(bookId, id) {
    return this.prisma.$transaction(async (tx) => {
      const reference = await this.borrowRepository.findBookReference(id, tx);
      if (!reference) throw new NotFoundError(`Borrowing ${id} was not found.`);
      if (reference.bookId === null) {
        const borrowing = await this.borrowRepository.findById(id, tx);
        Borrow.assertCanReturn(borrowing);
      }
      if (reference.bookId !== bookId) {
        throw new NotFoundError(`Borrowing ${id} was not found for book ${bookId}.`);
      }

      const lockedBook = await this.bookRepository.lockById(bookId, tx);
      if (lockedBook.length === 0) throw new NotFoundError(`Book ${bookId} was not found.`);
      await this.borrowRepository.lockById(id, tx);
      const borrowing = await this.borrowRepository.findById(id, tx);
      if (!borrowing) throw new NotFoundError(`Borrowing ${id} was not found.`);
      Borrow.assertCanReturn(borrowing);

      const changed = await this.borrowRepository.markReturned(id, new Date(), tx);
      if (changed.count !== 1) {
        throw new ConflictError("This borrowing has already been returned.");
      }

      const restored = await this.bookRepository.incrementAvailableCopies(
        borrowing.bookId,
        borrowing.book.totalCopies,
        tx
      );
      if (restored.count !== 1) {
        throw new ConflictError("The book's available-copy count is inconsistent.");
      }
      return this.borrowRepository.findById(id, tx);
    });
  }

  getAll() {
    return this.borrowRepository.findAll();
  }

  async getById(id) {
    const borrowing = await this.borrowRepository.findById(id);
    if (!borrowing) throw new NotFoundError(`Borrowing ${id} was not found.`);
    return borrowing;
  }
}

module.exports = BorrowService;
