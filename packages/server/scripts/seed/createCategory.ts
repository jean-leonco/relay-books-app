import { DeepPartial } from '@booksapp/types';

import { Category, ICategory } from '../../src/models';

const createCategory = async (args: DeepPartial<ICategory>) => {
  return new Category(args).save();
};

export default createCategory;
