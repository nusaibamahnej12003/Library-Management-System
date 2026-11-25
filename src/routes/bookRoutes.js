const express = require("express");

function createBookRoutes(controller) {
  const router = express.Router();
  router.post("/", controller.create);
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);
  router.post("/:id/borrow", controller.borrow);
  router.post("/:id/return", controller.return);
  return router;
}

module.exports = createBookRoutes;
