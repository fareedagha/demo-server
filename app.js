const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const config = require("config");
const { ObjectID } = require('mongodb');
const { initializeWebSocket } = require('./src/api/webSockets/websocket'); // Adjust the path accordingly

require("./src/passport");
const http = require('http').createServer(app);
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
app.use(`${root}/products`, auth, productController);
app.use(logErrors);
app.use(clientErrorHandler);

app.get("/", (req, res) => {
  res.send("Hello demo app! ");
});
initializeWebSocket(http);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}.`);
});