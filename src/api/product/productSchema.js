const { string } = require("@hapi/joi");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const productSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number(),
  quantity: Joi.number(),
  sku: Joi.number(),
  desc: Joi.string(),
  image: Joi.string(),
  createdByUserId: Joi.objectId(),
});

module.exports = productSchema;
