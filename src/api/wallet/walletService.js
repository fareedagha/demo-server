const WalletRepository = require("./walletRepository");
const { ObjectId } = require("mongodb");
const ProductService = require("../product/productService");
const productService = new ProductService();
const TransactionService = require('../transaction/transactionService');
const transactionService = new TransactionService();

const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const walletSchema = require("./walletSchema");
class WalletService {
  constructor() {
    this.repository = new WalletRepository();
  }

  validate(data, context) {
    let options = {
      abortEarly: false,
      context: context,
    };
    return walletSchema.validateAsync(data, options);
  }

  findById(id, params = undefined) {
    return this.repository.findById(id, params);
  }

  addWallet(data) {
    return this.validate(data, {
      reqType: "POST",
    }).then(async () => {
      let newWallet = await this.repository.add(data);
      return newWallet;
    });
  }

  async buyProduct(data) {
    const { userId, productId } = data;
    const walletData = await this.findOne({ userId: new ObjectId(userId) });
    const product = await productService.findById(productId);
    const orderId = this.randomPassword(12)
    if (product.price > walletData.totalAmount) {
      const addTransaction =  await transactionService.addTransaction({
        type: 'Purchase',
        amount: product.price,
        status: 'failed',
        orderId: orderId,
        message: 'Buy Product (failed due to incificient balance)',
        userId: userId
      })
      
      throw {
        details: [
          {
            message: "You have incificient balance to buy this product",
          },
        ],
      };
    }

    if (product.quantity <= 0) {
      const addTransaction =  await transactionService.addTransaction({
        type: 'Purchase',
        amount: product.price,
        status: 'failed',
        orderId: orderId,
        message: 'Buy Product (failed due to product is out of stock)',
        userId: userId
      })
      throw {
        details: [
          {
            message: "Product is out of Stock",
          },
        ],
      };
    }

    const newQuantity = product.quantity - 1;
    const newWalletAmount = (walletData.totalAmount - product.price);
    const newPurchaseAmount = (walletData.totalPurchase + product.price)
    const updateProductQuantity = await productService.editProduct(
      product._id,
      { quantity: newQuantity }
    );
   
    const addTransaction =  await transactionService.addTransaction({
      type: 'Purchase',
      amount: product.price,
      status: 'success',
      orderId: orderId,
      message: 'Buy Product',
      userId: userId
    })
    const updatedProduct = await this.repository.edit(walletData._id, {
      totalAmount: newWalletAmount,
      totalPurchase: newPurchaseAmount
    });
    return updatedProduct;
  }

  async topUp(data) {
    let walletData = await this.findOne({ userId: new ObjectId(data.userId) });
    const orderId = this.randomPassword(12)
    const amount = parseInt(data.amount, 10);
    if (!walletData) {
      const addTransaction =  await transactionService.addTransaction({
        type: 'Topup',
        amount: amount,
        status: 'failed',
        orderId: orderId,
        message: 'Topup (failed due to invalid user)',
        userId: data.userId
      })
      throw {
        details: [
          {
            message: "Invalid User",
          },
        ],
      };
    }

    const newAmount = walletData.totalAmount + amount;
    const newTopup = walletData.totalTopup + amount;

    const addTransaction =  await transactionService.addTransaction({
      type: 'Topup',
      amount: amount,
      status: 'success',
      orderId: orderId,
      message: `Topup Amount of ${amount}`,
      userId: data.userId
    })

    const updatedUser = await this.repository.edit(walletData._id, {
      totalAmount: newAmount,
      totalTopup: newTopup,
    });
    return updatedUser;
  }

  async withdraw(data) {
    const walletData = await this.findOne({
      userId: new ObjectId(data.userId),
    });
    const amount = parseInt(data.amount, 10);
    const orderId = this.randomPassword(12)

    if (!walletData) {

      const addTransaction =  await transactionService.addTransaction({
        type: 'Widthraw',
        amount: amount,
        status: 'failed',
        orderId: orderId,
        message: 'Widhraw Amount (failed due to invalid user)',
        userId: data.userId
      })

      throw {
        details: [
          {
            message: "Invalid User",
          },
        ],
      };
    }
    if (amount <= 0) {
      const addTransaction =  await transactionService.addTransaction({
        type: 'Widthraw',
        amount: amount,
        status: 'failed',
        orderId: orderId,
        message: 'Widhraw Amount (failed due to invalid amount)',
        userId: data.userId
      })
      throw {
        details: [
          {
            message: "Invalid Amount",
          },
        ],
      };
    }

    if (amount > walletData.totalAmount) {
      const addTransaction =  await transactionService.addTransaction({
        type: 'Widthraw',
        amount: amount,
        status: 'failed',
        orderId: orderId,
        userId: data.userId,
        message: 'Widhraw Amount (failed due to incificeint amount to widraw)'
      })
      throw {
        details: [
          {
            message: "You have incificeint amount to widraw",
          },
        ],
      };
    }

    let newAmount = walletData.totalAmount - amount;
    let newWidraw = walletData.totalWidraw + amount;

    const addTransaction =  await transactionService.addTransaction({
      type: 'Widthraw',
      amount: amount,
      status: 'success',
      orderId: orderId,
      message: `Widthraw Amount of ${amount}`,
      userId: data.userId
    })
    const updatedUser = await this.repository.edit(walletData._id, {
      totalAmount: newAmount,
      totalWidraw: newWidraw,
    });
    return updatedUser;
  }

  async editWallet(id, wallet) {
    const updatedWallet = await this.repository.edit(id, wallet);
    return updatedWallet;
  }

  async findByUserId(userId) {
    const walletData = await this.findOne({ userId: new ObjectId(userId) });
    if (!walletData) {
      const newData = await this.addWallet({
        totalAmount: 0,
        totalTopup: 0,
        totalWidraw: 0,
        totalPurchase: 0,
        userId: userId,
      });
      const walletData = await this.findById(newData.insertedId);
      return walletData;
    } else {
      return walletData;
    }
  }

  async deleteWallet(id) {
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

  randomPassword(length) {
    const lettersBig = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lettersSmall = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@#$%^&*()-+<>";
    const numbers = "0123456789"

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

module.exports = WalletService;
