class BorrowRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data, db = this.prisma) {
    return db.borrowing.create({ data });
  }

  findAll(db = this.prisma) {
    return db.borrowing.findMany({
      include: { book: { select: { id: true, title: true, isbn: true } } },
      orderBy: { id: "asc" }
    });
  }

  findById(id, db = this.prisma) {
    return db.borrowing.findUnique({
      where: { id },
      include: { book: { select: { id: true, title: true, isbn: true } } }
    });
  }

  findBookReference(id, db) {
    return db.borrowing.findUnique({ where: { id }, select: { id: true, bookId: true } });
  }

  markReturned(id, returnedAt, db) {
    return db.borrowing.updateMany({
      where: { id, status: "BORROWED" },
      data: { status: "RETURNED", returnedAt }
    });
  }

  lockById(id, db) {
    return db.$queryRaw`SELECT "id" FROM "Borrowing" WHERE "id" = ${id} FOR UPDATE`;
  }
}

module.exports = BorrowRepository;
