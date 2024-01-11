const { string } = require('@hapi/joi');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const TransactionSchema = Joi.object({
  type: Joi.string(),
  amount: Joi.number(),
  status: Joi.string(),
  orderId: Joi.string(),
  message: Joi.string(),
  userId:Joi.objectId(),
});

module.exports = TransactionSchema