import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  createUser,
  createReading,
  createBook,
} from '../../../../test/helpers';

import ReadingModel, { IReading } from '../ReadingModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadingModel', () => {
  it('should create new reading using ReadingModel', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const readPages = 5;

    const reading = await new ReadingModel({
      userId: user._id,
      bookId: book._id,
      readPages,
    }).save();

    const readingObj = await ReadingModel.findOne({ _id: reading._id }).lean<IReading>();

    expect(readingObj?.userId).toMatchObject(user._id);
    expect(readingObj?.bookId).toMatchObject(book._id);
    expect(readingObj?.readPages).toBe(readPages);
    expect(sanitizeTestObject(readingObj)).toMatchSnapshot();
  });

  it('should create new reading using createRow', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });

    const reading = await createReading();

    const readingObj = await ReadingModel.findOne({ _id: reading._id }).lean<IReading>();

    expect(readingObj?.userId).toMatchObject(user._id);
    expect(readingObj?.bookId).toMatchObject(book._id);
    expect(readingObj?.readPages).toBe(1);
  });

  it('should create new reading with custom properties', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const readPages = 5;

    const reading = await createReading({ userId: user._id, bookId: book._id, readPages });

    const readingObj = await ReadingModel.findOne({ _id: reading._id }).lean<IReading>();

    expect(readingObj?.userId).toMatchObject(user._id);
    expect(readingObj?.bookId).toMatchObject(book._id);
    expect(readingObj?.readPages).toBe(readPages);
  });
});
