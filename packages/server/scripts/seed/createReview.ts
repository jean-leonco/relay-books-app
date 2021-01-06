import faker from 'faker';

import ReviewModel, { IReview } from '../../src/modules/review/ReviewModel';

const createReview = async (args: Partial<IReview>) => {
  const rating = args.rating || faker.random.number(5);
  const description = faker.random.number(100) % 2 === 0 ? faker.lorem.paragraph() : '';

  return new ReviewModel({ rating, description, ...args }).save();
};

export default createReview;
