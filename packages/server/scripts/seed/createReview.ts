import faker from 'faker';

import { DeepPartial } from '@booksapp/types';

import { Review, IReview } from '../../src/models';

const createReview = async (args: DeepPartial<IReview>) => {
  const rating = args.rating || faker.random.number(5);
  const description = faker.random.number(100) % 2 === 0 ? faker.lorem.paragraph() : '';

  return new Review({ rating, description, ...args }).save();
};

export default createReview;
