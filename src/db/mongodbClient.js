const mongoClient = require("mongodb").MongoClient;

const dotenv = require("dotenv");
const config = dotenv.config().parsed;

let dbClient = null;
let dbUrl = config.dbUrl;
let dbName = config.dbName;

module.exports = async function getMongoDBClient() {
  if (dbClient) {
    return dbClient;
  }

  console.log("Connecting to MongoDB client...");

  dbClient = mongoClient
    .connect(dbUrl, {
      useNewUrlParser: true,
      ignoreUndefined: true,
      maxPoolSize: 200,
    })
    .then((client) => {
      return client.db(dbName);
    })
    .catch((err) => {
      console.log(`Error occurred while connecting to mongodb: ${err}`);
    });

  return dbClient;
};
