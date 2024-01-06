const mongoClient = require("mongodb").MongoClient;
// const config = require("config");
// const logger = require("../utils/logger");

const dotenv = require('dotenv');
const config = dotenv.config().parsed;

let dbClient = null;
let dbUrl = config.dbUrl;
let dbName = config.dbName;
// const pass = 'cHukg7OoT6HpRtvI'
// let  dbUrl = `mongodb+srv://fareedagha7440:${pass}@cluster0.dquf1ue.mongodb.net/?retryWrites=true&w=majority`;
// let dbName = 'demo-test';


module.exports = async function getMongoDBClient() {
  if (dbClient) {
    return dbClient;
  }
//  logger.info("Connecting to MongoDB client...");
console.log("Connecting to MongoDB client...")
  // const { url, name } = config.get("db");

  dbClient = mongoClient
  .connect(dbUrl, {
    useNewUrlParser: true,
    ignoreUndefined: true,
    maxPoolSize: 200
    
  })
  .then((client) => {
   // logger.info("MongoDB client has been successfully created");
    return client.db(dbName);
  })
  .catch((err) => {
    console.log(`Error occurred while connecting to mongodb: ${err}`);
  });

  // dbClient.then(db => {
  //   console.log('poolSize', db.serverConfig)
  // })
  return dbClient;

}