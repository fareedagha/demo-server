const ProductRepository = require("./productRepository");
const bcrypt = require('bcrypt');
const Joi = require("@hapi/joi");
const { getIo } = require('../webSockets/websocket');
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
      getIo().emit('productAdded', { message: 'A new product has been added!', data:product });
      console.log('new', newProduct)
      return newProduct;
    });
  }



  addMany(products) {
    return this.repository.addMany(products);
  }

  async editProduct(id, product) {
    if (product.password) {
      const salt = await bcrypt.genSalt(15)
      product.password = await bcrypt.hash(product.password, salt);
    }
    const updatedProduct = await this.repository.edit(id, product);
    return updatedProduct;
  }

  async deleteProduct(id) {
    const deleteDef = this.repository.delete(id);
    return deleteDef
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


  randomPassword(length) {
    const lettersBig = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lettersSmall = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@#$%^&*()-+<>";
    const numbers = "0123456789";

    var pass = "";
    for (var x = 0; x < length; x++) {
      if (x === 0) {
        var i = Math.floor(Math.random() * lettersBig.length);
        pass += lettersBig.charAt(i);
      }

      if (x === 1) {
        var i = Math.floor(Math.random() * lettersSmall.length);
        pass += lettersSmall.charAt(i);
      }

      if (x === 2) {
        var i = Math.floor(Math.random() * symbols.length);
        pass += symbols.charAt(i);
      }

      if (x > 2) {
        var i = Math.floor(Math.random() * numbers.length);
        pass += numbers.charAt(i);
      }
    }

    return pass;
  }

  findOne(params) {
    return this.repository.findByFilter(params);
  }
}

module.exports = ProductService;
