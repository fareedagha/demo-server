const { string } = require('@hapi/joi');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const walletSchema = Joi.object({
  totalAmount: Joi.number(),
  totalTopup: Joi.number(),
  totalWidraw: Joi.number(),
  totalPurchase: Joi.number(),
  userId:Joi.objectId(),
});

module.exports = walletSchema