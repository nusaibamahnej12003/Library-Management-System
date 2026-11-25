const express = require("express");
const { prisma } = require("./config/database");
const BookRepository = require("./repositories/bookRepository");
const BorrowRepository = require("./repositories/borrowRepository");
const BookService = require("./services/bookService");
const BorrowService = require("./services/borrowService");
const createBookController = require("./controllers/bookController");
const createBorrowController = require("./controllers/borrowController");
const createBookRoutes = require("./routes/bookRoutes");
const createBorrowRoutes = require("./routes/borrowRoutes");
const requestId = require("./middlewares/requestId");
const errorHandler = require("./middlewares/errorHandler");
const { NotFoundError } = require("./utils/errors");

const bookRepository = new BookRepository(prisma);
const borrowRepository = new BorrowRepository(prisma);
const bookService = new BookService({ prisma, bookRepository });
const borrowService = new BorrowService({ prisma, bookRepository, borrowRepository });
const bookController = createBookController(bookService);
const borrowController = createBorrowController(borrowService);

const app = express();
app.use(requestId);
app.use(express.json());
app.use("/api/books", createBookRoutes({
  ...bookController,
  borrow: borrowController.borrow,
  return: borrowController.return
}));
app.use("/api/borrowings", createBorrowRoutes(borrowController));
app.use((req, res, next) => next(new NotFoundError(`Route ${req.method} ${req.originalUrl} was not found.`)));
app.use(errorHandler);

module.exports = { app, bookService, borrowService };
