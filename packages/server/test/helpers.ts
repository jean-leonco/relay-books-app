import mongoose from 'mongoose';
import MockDate from 'mockdate';

export { getContext } from './getContext';

export const gql = String.raw;

export * from './createResource/createRows';

process.env.NODE_ENV = 'test';

/* MONGO */
// Just in case you want to debug something
// mongoose.set('debug', true);
// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
mongoose.Promise = Promise;
const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  connectTimeoutMS: 10000,
  bufferCommands: false,
  bufferMaxEntries: 0,
  autoIndex: true,
  autoReconnect: false,
};

export async function connectMongoose(customMongooseOptions = {}) {
  jest.setTimeout(20000);

  return mongoose.connect(global.__MONGO_URI__, {
    ...mongooseOptions,
    ...customMongooseOptions,
    dbName: global.__MONGO_DB_NAME__,
  });
}

export async function clearDatabase() {
  await mongoose.connection.db.dropDatabase();
}

export async function disconnectMongoose() {
  await mongoose.disconnect();
}

export async function clearDbAndRestartCounters() {
  await clearDatabase();
  restartCounters();
}

export const restartCounters = () => {
  global.__COUNTERS__ = Object.keys(global.__COUNTERS__).reduce((prev, curr) => ({ ...prev, [curr]: 0 }), {});
};
/* MONGO */

/* FETCH */
export function mockFetchResponse(response: {}) {
  const mockJsonPromise = Promise.resolve(response);
  const mockFetchPromise = Promise.resolve({
    json: () => mockJsonPromise,
  });

  jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);
}
/* FETCH */

/* MOCK DATE */
let runningDate: Date | null = null;
export const resetRunningDate = () => {
  runningDate = null;
};

export const FIVE_SECONDS_IN_MILLISECONDS = 1000 * 5;
export const ONE_MINUTE_IN_MILLISECONDS = 1000 * 60;
export const FIVE_MINUTES_IN_MILLISECONDS = 1000 * 60 * 5;
export const TEN_MINUTES_IN_MILLISECONDS = 1000 * 60 * 10;
export const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
export const N_HOUR_IN_MILLISECONDS = (n: number) => ONE_HOUR_IN_MILLISECONDS * n;
export const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
export const N_DAYS_IN_MILLISECONDS = (n: number) => ONE_DAY_IN_MILLISECONDS * n;
export const plusDate = (date, increment) => new Date(date.valueOf() + increment);

export const bumpDate = (date: Date = new Date('01/01/2020'), increment = ONE_DAY_IN_MILLISECONDS) => {
  if (runningDate === null) {
    runningDate = date;
  }

  const plusDateResult = plusDate(runningDate, increment);

  MockDate.set(plusDateResult);
  runningDate = plusDateResult;
  return plusDateResult;
};
/* MOCK DATE */
