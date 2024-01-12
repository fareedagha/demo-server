const { ObjectId } = require("mongodb");
const BaseRepository = require("../../db/baseRepository");

class ProductRepository extends BaseRepository {
  constructor() {
    super("products");
  }

  format(product) {
    if (product.createdByUserId) {
      product.createdByUserId = new ObjectId(product.createdByUserId);
    }
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
    return this.dbClient.then((db) =>
      db.collection(this.collection).findOne({ email })
    );
  }

  findByProductname(productname) {
    return this.dbClient.then((db) =>
      db.collection(this.collection).findOne({
        productname,
        // blocked: {
        //   $in: [null, false]
        // }
      })
    );
  }

  listAggregated(params) {
    let filter = {
      pipeline: [],
      pageSize: params.pageSize,
      pageNumber: params.pageNumber,
      sortBy: params.sortBy,
      orderBy: params.orderBy,
    };

    if (params.project) {
      filter.pipeline.push({
        $project: this.parseProjectParams(params.project),
      });
    }
    return super.listAggregated(filter);
  }

  parseProjectParams(project) {
    for (const key in project) {
      if (project.hasOwnProperty(key)) {
        project[key] = parseInt(project[key]);
      }
    }
    return project;
  }
}

module.exports = ProductRepository;
