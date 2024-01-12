const express = require("express");
const router = express.Router();
const UserService = require("./userService");
const userService = new UserService();

router.get("/", (req, res) => {
  userService.list(req.query).then((users) => res.send(users));
});

router.put("/current", (req, res) => {
  userService
    .editUser(req.user.id, req.body)
    .then((user) => res.send(user))
    .catch((err) => res.status(400).send(err.message));
});

router.get("/:id", (req, res) => {
  userService.findById(req.params.id, req.query).then((user) => res.send(user));
});

router.delete("/:id", (req, res) => {
  userService
    .deleteUser(req.params.id, req.user)
    .then(() => res.send({ id: req.params.id }));
});

router.post("/register", (req, res) => {
  userService
    .addUser(req.body)
    .then((user) => res.send({ insertedId: user.insertedId }))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  userService
    .editUser(req.params.id, req.body, req.user)
    .then((user) => res.send(user));
});
module.exports = router;
