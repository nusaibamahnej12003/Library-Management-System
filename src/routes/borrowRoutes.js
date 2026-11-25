const express = require("express");

function createBorrowRoutes(controller) {
  const router = express.Router();
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  return router;
}

module.exports = createBorrowRoutes;
