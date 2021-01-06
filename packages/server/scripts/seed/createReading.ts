import faker from 'faker';

import { IBook } from '../../src/modules/book/BookModel';
import ReadingModel, { IReading } from '../../src/modules/reading/ReadingModel';

const createReading = async (args: Partial<IReading & { book: IBook }>) => {
  const readPages = args.readPages || faker.random.number(args.book?.pages);

  return new ReadingModel({ readPages, ...args }).save();
};

export default createReading;
