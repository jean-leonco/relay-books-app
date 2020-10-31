import faker from 'faker';

import { getYear } from 'date-fns';

import { DeepPartial } from '@booksapp/types';

import { Book, IBook } from '../../src/models';

const createBook = async (args: DeepPartial<IBook>) => {
  const name = args.name || faker.commerce.productName();
  const author = args.author || faker.name.findName();
  const description = args.description || faker.commerce.productDescription();
  const releaseYear = args.releaseYear || getYear(faker.date.past());
  const pages = args.pages || faker.random.number(400);
  const bannerUrl = args.bannerUrl || faker.image.image();

  return new Book({ name, author, description, releaseYear, pages, bannerUrl, ...args }).save();
};

export default createBook;
