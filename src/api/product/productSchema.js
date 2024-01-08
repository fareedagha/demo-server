const { string } = require('@hapi/joi');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const productSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number(),
  quantity: Joi.number(),
  sku: Joi.string(),
  desc: Joi.string(),
  image: Joi.string(),

});

module.exports = productSchema