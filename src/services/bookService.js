const Book = require("../domain/Book");
const {
  ConflictError,
  NotFoundError
} = require("../utils/errors");

class BookService {
  constructor({ prisma, bookRepository }) {
    this.prisma = prisma;
    this.bookRepository = bookRepository;
  }

  async create(data) {
    try {
      return await this.bookRepository.create(data);
    } catch (error) {
      if (error.code === "P2002") {
        throw new ConflictError("A book with this ISBN already exists.");
      }
      throw error;
    }
  }

  getAll() {
    return this.bookRepository.findAll();
  }

  async getById(id) {
    const book = await this.bookRepository.findById(id);
    if (!book) throw new NotFoundError(`Book ${id} was not found.`);
    return book;
  }

  async update(id, changes) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const locked = await this.bookRepository.lockById(id, tx);
        if (locked.length === 0) throw new NotFoundError(`Book ${id} was not found.`);
        const current = await this.bookRepository.findById(id, tx);
        const borrowedCopies = current.totalCopies - current.availableCopies;
        const totalCopies = changes.totalCopies ?? current.totalCopies;
        if (totalCopies < borrowedCopies) {
          throw new ConflictError("totalCopies cannot be less than the number of currently borrowed copies.");
        }

        const data = {
          ...changes,
          totalCopies,
          availableCopies: totalCopies - borrowedCopies
        };
        Book.assertValidCopies(data.totalCopies, data.availableCopies);
        return this.bookRepository.update(id, data, tx);
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new ConflictError("A book with this ISBN already exists.");
      }
      if (error.code === "P2025") {
        throw new NotFoundError(`Book ${id} was not found.`);
      }
      throw error;
    }
  }

  async delete(id) {
    return this.prisma.$transaction(async (tx) => {
      const locked = await this.bookRepository.lockById(id, tx);
      if (locked.length === 0) throw new NotFoundError(`Book ${id} was not found.`);
      const activeBorrowings = await this.bookRepository.countActiveBorrowings(id, tx);
      Book.assertCanDelete(activeBorrowings);
      return this.bookRepository.delete(id, tx);
    });
  }
}

module.exports = BookService;
