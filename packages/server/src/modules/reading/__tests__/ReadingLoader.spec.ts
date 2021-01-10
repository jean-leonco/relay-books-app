import faker from 'faker';

import { connectMongoose, clearDbAndRestartCounters, disconnectMongoose } from '@workspace/test-utils';

import { createBook, createReading, createUser, getContext } from '../../../test/utils';

import * as ReadingLoader from '../ReadingLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadingLoader', () => {
  it('should be able to load a reading', async () => {
    const user = await createUser();
    const reading = await createReading();

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.load(context, reading._id);

    expect(readingObj).not.toBe(null);
    expect(readingObj!.bookId).toEqual(reading.bookId);
    expect(readingObj!.readPages).toEqual(reading.readPages);
    expect(readingObj!.bookId).toEqual(reading.bookId);
    expect(readingObj!.userId).toMatchObject(reading.userId);
  });

  it('should not be able to load a reading without context.user', async () => {
    const reading = await createReading();

    const context = await getContext({});
    const readingObj = await ReadingLoader.load(context, reading._id);

    expect(readingObj).toBe(null);
  });

  it('should not be able to load another user reading', async () => {
    const reading = await createReading();
    const user = await createUser();

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.load(context, reading._id);

    expect(readingObj).toBe(null);
  });

  it('should be able to load a list of readings', async () => {
    const user = await createUser();

    for (let i = 0; i < 11; i++) {
      await createReading();
    }

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.loadAll(context, {});

    expect(readingObj).not.toBe(null);
    expect(readingObj.count).toBe(11);
  });

  it('should be able to load only me list of readings', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createReading();
    }

    const user2 = await createUser();
    for (let i = 0; i < 3; i++) {
      await createReading({ userId: user2._id });
    }

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.loadAll(context, {});

    expect(readingObj).not.toBe(null);
    expect(readingObj.count).toBe(6);
  });

  it('should not be able to load a list of readings without context.user', async () => {
    for (let i = 0; i < 11; i++) {
      await createReading();
    }

    const context = await getContext();
    const readingObj = await ReadingLoader.loadAll(context, {});

    expect(readingObj).not.toBe(null);
    expect(readingObj.count).toBe(0);
  });

  it('should be able to load me last incomplete reading', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      const bookPages = faker.random.number({ min: 2, max: 100 });
      const book = await createBook({ pages: bookPages });

      const shouldFinishBook = faker.random.boolean();
      await createReading({
        bookId: book._id,
        readPages: shouldFinishBook ? bookPages : faker.random.number({ min: 1, max: bookPages - 1 }),
      });
    }

    const lastIncompleteReadingBook = await createBook({ pages: 15 });
    const lastIncompleteReading = await createReading({ bookId: lastIncompleteReadingBook._id, readPages: 10 });

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.loadMeLastIncompleteReading(context);

    expect(readingObj).not.toBeNull();
    expect(readingObj?.readPages).toBe(lastIncompleteReading.readPages);
    expect(readingObj?.bookId).toMatchObject(lastIncompleteReading.bookId);
  });

  it('should not be able to load last incomplete reading without user', async () => {
    for (let i = 0; i < 6; i++) {
      const bookPages = faker.random.number({ min: 2, max: 100 });
      const book = await createBook({ pages: bookPages });

      const shouldFinishBook = faker.random.boolean();
      await createReading({
        bookId: book._id,
        readPages: shouldFinishBook ? bookPages : faker.random.number({ min: 1, max: bookPages - 1 }),
      });
    }

    const context = await getContext();
    const readingObj = await ReadingLoader.loadMeLastIncompleteReading(context);

    expect(readingObj).toBeNull();
  });

  it('should load last incomplete reading as null if all readings are finished', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      const bookPages = faker.random.number({ min: 2, max: 100 });
      const book = await createBook({ pages: bookPages });
      await createReading({ bookId: book._id, readPages: bookPages });
    }

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.loadMeLastIncompleteReading(context);

    expect(readingObj).toBeNull();
  });

  it('should load last incomplete reading as null if me has no readings', async () => {
    const user = await createUser();

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.loadMeLastIncompleteReading(context);

    expect(readingObj).toBeNull();
  });

  it('should not be able to load another user last incomplete reading', async () => {
    for (let i = 0; i < 6; i++) {
      const bookPages = faker.random.number({ min: 2, max: 100 });
      const book = await createBook({ pages: bookPages });

      const shouldFinishBook = faker.random.boolean();
      await createReading({
        bookId: book._id,
        readPages: shouldFinishBook ? bookPages : faker.random.number({ min: 1, max: bookPages - 1 }),
      });
    }

    const lastIncompleteReadingBook = await createBook({ pages: 15 });
    await createReading({ bookId: lastIncompleteReadingBook._id, readPages: 10 });

    const user = await createUser();

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.loadMeLastIncompleteReading(context);

    expect(readingObj).toBeNull();
  });

  it('should be return true if me has reading', async () => {
    for (let i = 0; i < 6; i++) {
      await createReading();
    }

    const user = await createUser();
    await createReading({ userId: user._id });

    const context = await getContext({ user });
    const hasReading = await ReadingLoader.loadMeHasReading(context);

    expect(hasReading).toBe(true);
  });

  it('should return false if me has no reading', async () => {
    for (let i = 0; i < 6; i++) {
      await createReading();
    }

    const user = await createUser();

    const context = await getContext({ user });
    const hasReading = await ReadingLoader.loadMeHasReading(context);

    expect(hasReading).toBe(false);
  });
});
