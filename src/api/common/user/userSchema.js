const { string } = require("@hapi/joi");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const userSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
});

module.exports = userSchema;
