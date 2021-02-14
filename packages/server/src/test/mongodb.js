const NodeEnvironment = require('jest-environment-node');
const { MongoMemoryServer } = require('mongodb-memory-server');

class MongoDbEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    this.mongod = new MongoMemoryServer({
      binary: {
        version: '4.4.3',
        systemBinary: '/usr/bin/mongod',
      },
      autoStart: false,
    });
  }

  async setup() {
    await super.setup();
    await this.mongod.start();

    this.global.__MONGO_URI__ = await this.mongod.getUri();
    this.global.__MONGO_DB_NAME__ = await this.mongod.getDbName();
    this.global.__COUNTERS__ = {};
  }

  async teardown() {
    await super.teardown();
    await this.mongod.stop();

    this.mongod = null;
    this.global = {};
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoDbEnvironment;
