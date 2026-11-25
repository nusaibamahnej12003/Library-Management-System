const { validateBorrow, validateReturn } = require("../validators/borrowValidator");
const parseId = require("../utils/parseId");

function createBorrowController(borrowService) {
  return {
    borrow: async (req, res) => {
      const { borrowerName } = validateBorrow(req.body);
      res.status(201).json(await borrowService.borrow(parseId(req.params.id, "Book"), borrowerName));
    },
    return: async (req, res) => {
      const borrowingId = validateReturn(req.body);
      res.json(await borrowService.returnBorrowing(parseId(req.params.id, "Book"), borrowingId));
    },
    getAll: async (req, res) => {
      res.json(await borrowService.getAll());
    },
    getById: async (req, res) => {
      res.json(await borrowService.getById(parseId(req.params.id, "Borrowing")));
    }
  };
}

module.exports = createBorrowController;
