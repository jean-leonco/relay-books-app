import mongoose from 'mongoose';

import { restartCounters } from './counters';

process.env.NODE_ENV = 'test';

mongoose.Promise = Promise;

export const connectMongoose = async () => {
  jest.setTimeout(20000);

  return mongoose.connect(global.__MONGO_URI__, {
    autoIndex: true,
    autoReconnect: false,
    useFindAndModify: false,
    connectTimeoutMS: 10000,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    dbName: global.__MONGO_DB_NAME__,
  });
};

export const clearDatabase = async () => {
  await mongoose.connection.db.dropDatabase();
};

export const disconnectMongoose = async () => {
  await mongoose.disconnect();
};

export const clearDbAndRestartCounters = async () => {
  await clearDatabase();
  restartCounters();
};
