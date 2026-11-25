class BookRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data, db = this.prisma) {
    return db.book.create({ data });
  }

  findAll(db = this.prisma) {
    return db.book.findMany({ orderBy: { id: "asc" } });
  }

  findById(id, db = this.prisma) {
    return db.book.findUnique({ where: { id } });
  }

  update(id, data, db = this.prisma) {
    return db.book.update({ where: { id }, data });
  }

  delete(id, db = this.prisma) {
    return db.book.delete({ where: { id } });
  }

  countActiveBorrowings(bookId, db = this.prisma) {
    return db.borrowing.count({ where: { bookId, status: "BORROWED" } });
  }

  decrementAvailableCopies(id, db) {
    return db.book.updateMany({
      where: { id, availableCopies: { gt: 0 } },
      data: { availableCopies: { decrement: 1 } }
    });
  }

  incrementAvailableCopies(id, totalCopies, db) {
    return db.book.updateMany({
      where: { id, availableCopies: { lt: totalCopies } },
      data: { availableCopies: { increment: 1 } }
    });
  }

  lockById(id, db) {
    return db.$queryRaw`SELECT "id" FROM "Book" WHERE "id" = ${id} FOR UPDATE`;
  }
}

module.exports = BookRepository;
