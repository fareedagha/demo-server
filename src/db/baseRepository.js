const { ObjectId } = require('mongodb');
const getMongoDBClient = require('../db/mongodbClient');

class BaseRepository {
   constructor(collectionName) {
    this.dbClient = getMongoDBClient();
    this.collection = collectionName;
  }

  getCount() {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .countDocuments());
  }

  getCountFiltered(filter) {
    return this.dbClient
      .then(db => {
        // filtering here
        return db.collection(this.collection).countDocuments({});
      });
  }

  async findById(id) {
    const db = await this.dbClient;
    return await db
      .collection(this.collection)
      .findOne({ _id: new ObjectId(id) });
  }

  async findByFilter(filter) {
    const db = await this.dbClient;
    return await db
      .collection(this.collection)
      .findOne(filter);
  }

  add(item) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .insertOne(item));
  }

  addMany(items) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .insertMany(items));
  }

  updateMany(filter,items) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .update(filter, { $set: items }, { multi: true }));
  }

  async bulkWrite(operations) {

    let db = await this.dbClient;
    return await db
      .collection(this.collection)
      .bulkWrite(operations);
  }

  async edit(id, item) {

    let db = await this.dbClient;
    return await db
      .collection(this.collection)
      .updateOne({ _id: new ObjectId(id) }, { $set: item }, { upsert: true });
  }

  async update(filter, updateQuery, options) {

    let db = await this.dbClient;
    return await db
      .collection(this.collection)
      .updateOne(filter, updateQuery, options);
  }

  async delete(id) {
    const db = await this.dbClient;
    return await db
      .collection(this.collection)
      .deleteOne({ _id: new ObjectId(id) });
  }

  list() {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .find());
  }

  listFiltered(filter) {
    return this.dbClient
      .then(db => {
        const data = db.collection(this.collection)
          .find(filter.query || {});

        if (filter.sortBy && filter.orderBy) {
          const sortSettings = { [filter.sortBy]: filter.orderBy === 'ASC' ? 1 : -1 };
          data.sort(sortSettings);
        }

        if (filter.pageSize && filter.pageNumber) {
          data
            .skip(parseInt(filter.pageSize) * (parseInt(filter.pageNumber) - 1))
            .limit(parseInt(filter.pageSize));
        }

        return data.toArray();
      });
  }

  async listAggregated(filter) {

    if (filter.sortBy && filter.orderBy) {
      if (Array.isArray(filter.sortBy)) {
        let sortOptions = filter.sortBy.map((str) => ({
          [str]: filter.orderBy.toLowerCase() === 'asc' ? 1 : -1,
        }));
         sortOptions = Object.assign({}, ...sortOptions);
        filter.pipeline.push({
          $sort: sortOptions
        })
      }else{
        const sortSettings = {
          [filter.sortBy]: filter.orderBy.toLowerCase() === 'asc' ? 1 : -1
        };
        filter.pipeline.push({
          $sort: sortSettings
      })
      }
    
  }
    if (filter.pageSize && filter.pageNumber) {
      filter.pipeline.push({
        $skip: parseInt(filter.pageSize) * (parseInt(filter.pageNumber) - 1) 
      })
      filter.pipeline.push({
        $limit: parseInt(filter.pageSize) 
      })
    }

    const db = await this.dbClient;
    const data = db.collection(this.collection)
    .aggregate(filter.pipeline || {}, filter.options)
    let results = await data.toArray();
    data.close();

    return results;
  }
}

module.exports = BaseRepository;