const TransactionRepository = require("./transactionRepository");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const { getIo } = require("../webSockets/websocket");
Joi.objectId = require("joi-objectid")(Joi);

const TransactionSchema = require("./transactionSchema");
class TransactionService {
  constructor() {
    this.repository = new TransactionRepository();
  }

  validate(product, context) {
    let options = {
      abortEarly: false,
      context: context,
    };
    return TransactionSchema.validateAsync(product, options);
  }

  findById(id, params = undefined) {
    return this.repository.findById(id, params);
  }

  addTransaction(product) {
    return this.validate(product, {
      reqType: "POST",
    }).then(async () => {
      return this.repository.add(product);
    });
  }

  addMany(products) {
    return this.repository.addMany(products);
  }

  async editTransaction(id, product) {
    const updatedProduct = await this.repository.edit(id, product);
    return updatedProduct;
  }

  async deleteTransaction(id) {
    const deleteDef = this.repository.delete(id);
    return deleteDef;
  }

  list(filter) {
    return Promise.all([
      this.repository.listAggregated(filter),
      // this.repository.getCountFiltered(filter),
    ]).then(([data]) => {
      return {
        data: data,
        meta: {
          count: 0,
        },
      };
    });
  }

  findOne(params) {
    return this.repository.findByFilter(params);
  }
}

module.exports = TransactionService;
