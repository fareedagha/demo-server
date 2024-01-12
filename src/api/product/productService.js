const ProductRepository = require("./productRepository");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const { getIo } = require("../webSockets/websocket");
Joi.objectId = require("joi-objectid")(Joi);

const productSchema = require("./productSchema");
class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  validate(product, context) {
    let options = {
      abortEarly: false,
      context: context,
    };
    return productSchema.validateAsync(product, options);
  }

  getCount() {
    return this.repository.getCount();
  }

  findByProductname(name) {
    return this.repository.findByProductname(name);
  }

  findById(id, params = undefined) {
    return this.repository.findById(id, params);
  }

  addProduct(product) {
    return this.validate(product, {
      reqType: "POST",
    }).then(async () => {
      let newProduct = await this.repository.add(product);
      getIo().emit("productAdded", {
        message: "A new product has been added!",
        data: product,
      });
      console.log("new", newProduct);
      return newProduct;
    });
  }

  addMany(products) {
    return this.repository.addMany(products);
  }

  async editProduct(id, product) {
    const updatedProduct = await this.repository.edit(id, product);
    return updatedProduct;
  }

  async deleteProduct(id) {
    const deleteDef = this.repository.delete(id);
    return deleteDef;
  }

  changePassword(id, salt, passwordHash) {
    return this.repository.changePassword(id, salt, passwordHash);
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

module.exports = ProductService;
