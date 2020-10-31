/* eslint-disable */
const MMS = require('mongodb-memory-server');
const NodeEnvironment = require('jest-environment-node');

const { default: MongodbMemoryServer } = MMS;

class MongoDbEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    // @TODO - enable replset if needed
    // this.mongod = new MongoMemoryReplSet({
    this.mongod = new MongodbMemoryServer({
      instance: {
        // settings here
        // dbName is null, so it's random
        // dbName: MONGO_DB_NAME,
      },
      binary: {
        version: '4.4.1',
        systemBinary: '/usr/bin/mongod',
        skipMD5: true,
      },
      // debug: true,
      autoStart: false,
    });
  }

  async setup() {
    await super.setup();
    // console.error('\n# MongoDB Environment Setup #\n');
    await this.mongod.start();
    this.global.__MONGO_URI__ = await this.mongod.getUri();
    this.global.__MONGO_DB_NAME__ = await this.mongod.getDbName();
    this.global.__COUNTERS__ = {
      user: 0,
      book: 0,
      review: 0,
      category: 0,
      reading: 0,
    };
  }

  async teardown() {
    await super.teardown();
    // console.error('\n# MongoDB Environment Teardown #\n');
    await this.mongod.stop();
    this.mongod = null;
    this.global = {};
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoDbEnvironment;
