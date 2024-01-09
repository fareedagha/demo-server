
const { ObjectId } = require('mongodb');
const BaseRepository = require('../../db/baseRepository');
// const helpers = require('../../helpers');


class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  format(product) {
    return product;
  }

  add(product) {
    product = this.format(product);

    if (!product.createdAt) {
      product.createdAt = new Date();
    }

    return super.add(product);
  }

  edit(id, product) {
    product = this.format(product);
    return super.edit(id, product);
  }

 

  findByEmail(email) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .findOne({ email }));
  }

  findByProductname(productname) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .findOne({
          productname,
          // blocked: {
          //   $in: [null, false]
          // }
        }));
  }

  changePassword(id, salt, passwordHash) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .updateOne({ _id:new ObjectId(id) }, { $set: { salt, passwordHash } }));
  }


  listAggregated(params) {
    let filter = {
      pipeline: [],
      pageSize: params.pageSize,
      pageNumber: params.pageNumber,
      sortBy: params.sortBy,
      orderBy: params.orderBy
    }

    


    if (params.email) {
      filter.pipeline.push({
        $match: {
          email: params.email
        }
      });
    }

   
    if (params.project) {
      filter.pipeline.push({
        $project: this.parseProjectParams(params.project)
      })
    }
    return super.listAggregated(filter);
  }

  parseProjectParams(project){
    for (const key in project) {
      if (project.hasOwnProperty(key)) {
        project[key] = parseInt(project[key]);
      }
    }
    return project;
  }




}

module.exports = ProductRepository;
