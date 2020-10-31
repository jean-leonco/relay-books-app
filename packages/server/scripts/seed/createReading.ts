import faker from 'faker';

import { DeepPartial } from '@booksapp/types';

import { Reading, IReading, IBook } from '../../src/models';

const createReading = async (args: DeepPartial<IReading & { book: IBook }>) => {
  const readPages = args.readPages || faker.random.number(args.book?.pages);

  return new Reading({ readPages, ...args }).save();
};

export default createReading;
