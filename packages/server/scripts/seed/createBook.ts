import { getYear } from 'date-fns';
import faker from 'faker';

import BookModel, { IBook } from '../../src/modules/book/BookModel';
import { ICategory } from '../../src/modules/category/CategoryModel';

const createBooks = async ({ bookCount, category }: { bookCount: number; category: ICategory }) => {
  const books: IBook[] = [];

  for (let i = 0; i < bookCount; i++) {
    const book = createBook({ categoryId: category._id });
    books.push(book);
  }

  return BookModel.insertMany(books);
};

const createBook = (args: Partial<IBook>) => {
  const name = args.name || faker.commerce.productName();
  const author = args.author || faker.name.findName();
  const description = args.description || faker.commerce.productDescription();
  const releaseYear = args.releaseYear || getYear(faker.date.past());
  //const pages = args.pages || faker.datatype.number(400);
  const pages = 21;
  const bannerUrl = args.bannerUrl || faker.image.image();

  return new BookModel({ name, author, description, releaseYear, pages, bannerUrl, ...args });
};

export default createBooks;
