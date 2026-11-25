const { validateBookCreate, validateBookUpdate } = require("../validators/bookValidator");
const parseId = require("../utils/parseId");

function createBookController(bookService) {
  return {
    create: async (req, res) => {
      const book = await bookService.create(validateBookCreate(req.body));
      res.status(201).json(book);
    },
    getAll: async (req, res) => {
      res.json(await bookService.getAll());
    },
    getById: async (req, res) => {
      res.json(await bookService.getById(parseId(req.params.id, "Book")));
    },
    update: async (req, res) => {
      res.json(await bookService.update(parseId(req.params.id, "Book"), validateBookUpdate(req.body)));
    },
    delete: async (req, res) => {
      await bookService.delete(parseId(req.params.id, "Book"));
      res.status(204).end();
    }
  };
}

module.exports = createBookController;
