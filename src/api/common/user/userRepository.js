const { ObjectId } = require("mongodb");
const BaseRepository = require("../../../db/baseRepository");

class UserRepository extends BaseRepository {
  constructor() {
    super("users");
  }

  format(user) {
    return user;
  }

  add(user) {
    user = this.format(user);

    if (!user.createdAt) {
      user.createdAt = new Date();
    }

    return super.add(user);
  }

  edit(id, user) {
    user = this.format(user);
    return super.edit(id, user);
  }

  findByEmail(email) {
    return this.dbClient.then((db) =>
      db.collection(this.collection).findOne({ email })
    );
  }

  findByUsername(username) {
    return this.dbClient.then((db) =>
      db.collection(this.collection).findOne({
        username,
        // blocked: {
        //   $in: [null, false]
        // }
      })
    );
  }

  changePassword(id, salt, passwordHash) {
    return this.dbClient.then((db) =>
      db
        .collection(this.collection)
        .updateOne({ _id: new ObjectId(id) }, { $set: { salt, passwordHash } })
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

    if (params.email) {
      filter.pipeline.push({
        $match: {
          email: params.email,
        },
      });
    }

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

module.exports = UserRepository;
