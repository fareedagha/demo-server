
const { ObjectId } = require('mongodb');
const BaseRepository = require('../../db/baseRepository');
// const helpers = require('../../helpers');


class WalletRepository extends BaseRepository {
  constructor() {
    super('wallets');
  }

  format(data) {
    if (data.userId) {
      data.userId = new ObjectId(data.userId);
    }
    return data;
  }

  add(data) {
    data = this.format(data);

    if (!data.createdAt) {
      data.createdAt = new Date();
    }

    return super.add(data);
  }

  findByUserId(userId) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .findOne({
          userId
        }));
  }

  edit(id, data) {
    data = this.format(data);
    return super.edit(id, data);
  }

  listAggregated(params) {
    let filter = {
      pipeline: [],
      pageSize: params.pageSize,
      pageNumber: params.pageNumber,
      sortBy: params.sortBy,
      orderBy: params.orderBy
    }
    if (params.userId) {
      filter.pipeline.push({
        $match: {
          userId:  new ObjectId(params.userId)
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

  parseProjectParams(project) {
    for (const key in project) {
      if (project.hasOwnProperty(key)) {
        project[key] = parseInt(project[key]);
      }
    }
    return project;
  }




}

module.exports = WalletRepository;
