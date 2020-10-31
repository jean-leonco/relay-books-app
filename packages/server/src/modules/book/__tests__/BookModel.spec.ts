import { clearDbAndRestartCounters, connectMongoose, disconnectMongoose, createBook } from '../../../../test/helpers';

import BookModel, { IBook } from '../BookModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('BookModel', () => {
  it('should create new book using BookModel', async () => {
    const name = 'O Alienista';
    const author = 'Machado de Assis';
    const description = 'This is a book created by Machado de Assis';
    const pages = 86;

    const bannerUrl = 'https://storage.googleapis.com/machadoDeAssis';

    const book = await new BookModel({
      name,
      author,
      description,
      pages,
      bannerUrl,
    }).save();

    const bookObj = await BookModel.findOne({ _id: book._id }).lean<IBook>();

    expect(bookObj?.name).toBe(name);
    expect(bookObj?.author).toBe(author);
    expect(bookObj?.description).toBe(description);
    expect(bookObj?.pages).toBe(pages);
    expect(bookObj?.bannerUrl).toBe(bannerUrl);
  });

  it('should create new book using createRow', async () => {
    const book = await createBook();

    const bookObj = await BookModel.findOne({ _id: book._id }).lean<IBook>();

    expect(bookObj?.name).toBe('name 1');
    expect(bookObj?.author).toBe('author 1');
    expect(bookObj?.description).toBe('description 1');
    expect(bookObj?.pages).toBe(10);
    expect(bookObj?.bannerUrl).toBe('bannerUrl 1');
  });

  it('should create new book with custom properties', async () => {
    const name = 'O Alienista';
    const author = 'Machado de Assis';
    const description = 'This is a book created by Machado de Assis';

    const book = await createBook({ name, author, description });

    const bookObj = await BookModel.findOne({ _id: book._id }).lean<IBook>();

    expect(bookObj?.name).toBe(name);
    expect(bookObj?.author).toBe(author);
    expect(bookObj?.description).toBe(description);
  });
});
