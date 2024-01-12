const express = require("express");
const router = express.Router();
const TransactionService = require("./transactionService");
const transactionService = new TransactionService();

router.get("/", (req, res) => {
  transactionService
    .list(req.query)
    .then((transactions) => res.send(transactions));
});

router.get("/:id", (req, res) => {
  transactionService
    .findById(req.params.id, req.query)
    .then((product) => res.send(product));
});

router.delete("/:id", (req, res) => {
  transactionService
    .deleteTransaction(req.params.id, req.product)
    .then(() => res.send({ id: req.params.id }));
});

router.post("/", (req, res) => {
  transactionService
    .addTransaction(req.body)
    .then((product) => {
      res.send({ productId: product.insertedId });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
});

router.put("/:id", (req, res) => {
  transactionService
    .editTransaction(req.params.id, req.body, req.product)
    .then((product) => res.send(product));
});
module.exports = router;
