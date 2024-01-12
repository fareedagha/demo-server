const express = require("express");
const router = express.Router();
const WalletService = require("./walletService");
const walletService = new WalletService();

router.post("/", (req, res) => {
  walletService
    .addWallet(req.body)
    .then((product) => {
      res.send({ productId: product.insertedId });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
});

router.get("/get-wallet-by-userId/:id", (req, res) => {
  walletService
    .findByUserId(req.params.id)
    .then((wallet) => {
      res.send({ wallet });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
});

router.post("/withdraw", (req, res) => {
  walletService
    .withdraw(req.body)
    .then((wallet) => {
      res.send({ wallet });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
});

router.post("/top-up", (req, res) => {
  walletService
    .topUp(req.body)
    .then((wallet) => {
      res.send({ wallet });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
});

router.post("/buy-ptoduct", (req, res) => {
  walletService
    .buyProduct(req.body)
    .then((wallet) => {
      res.send({ wallet });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
});

module.exports = router;
