const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const config = require("config");
const { ObjectID } = require('mongodb');
require("./src/passport");
function logErrors(err, req, res, next) {
  next(err);
}

const { port, root } = config.get("api");


function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: "Something went wrong." });
  } else {
    next(err);
  }
}

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const authController = require("./src/api/common/auth/authController");
const userController = require("./src/api/common/user/userController");
const productController = require("./src/api/product/productController");
const auth = passport.authenticate("jwt", { session: false });
app.use(`${root}/auth`, authController);
app.use(`${root}/users`, userController);
app.use(`${root}/products`, productController);
app.use(logErrors);
app.use(clientErrorHandler);

app.get("/", (req, res) => {
  res.send("Hello demo app! ");
});


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}.`);
});