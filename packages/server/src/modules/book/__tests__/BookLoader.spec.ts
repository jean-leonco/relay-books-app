import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  getContext,
  createBook,
  createUser,
} from '../../../../test/helpers';

import * as BookLoader from '../BookLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('BookLoader', () => {
  it('should be able to load a book', async () => {
    const user = await createUser();
    const book = await createBook();

    const context = await getContext({ user });
    const bookObj = await BookLoader.load(context, book._id);

    expect(bookObj).not.toBe(null);
    expect(bookObj!.name).toEqual(book.name);
    expect(bookObj!.author).toEqual(book.author);
    expect(bookObj!.description).toEqual(book.description);
  });

  it('should not be able to load a book without context.user', async () => {
    const book = await createBook();

    const context = await getContext({});
    const bookObj = await BookLoader.load(context, book._id);

    expect(bookObj).toBe(null);
  });

  it('should be able to load a list of Books', async () => {
    const user = await createUser();

    for (let i = 0; i < 11; i++) {
      await createBook();
    }

    const context = await getContext({ user });
    const bookObj = await BookLoader.loadBooks(context, {});

    expect(bookObj).not.toBe(null);
    expect(bookObj.count).toBe(11);
  });

  it('should not be able to load a list of Books without context.user', async () => {
    for (let i = 0; i < 11; i++) {
      await createBook();
    }

    const context = await getContext();
    const bookObj = await BookLoader.loadBooks(context, {});

    expect(bookObj).not.toBe(null);
    expect(bookObj.count).toBe(0);
  });
});
