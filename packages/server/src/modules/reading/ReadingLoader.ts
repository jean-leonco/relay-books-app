import { createLoader, getObjectId } from '@entria/graphql-mongo-helpers';

import { GraphQLContext } from '../../types';

import { registerLoader } from '../loader/loaderRegister';

import { IBook } from '../book/BookModel';
import ReviewModel from '../review/ReviewModel';

import { readingFilterMapping } from './filters/ReadingFiltersInputType';
import ReadingModel, { IReading } from './ReadingModel';

const viewerCanSee = (context: GraphQLContext, data: IReading) => {
  const userId = getObjectId(context.user?.id);

  if (!userId || !userId.equals(data.userId)) {
    return null;
  }

  if (!data.isActive) {
    return null;
  }

  return data;
};

const { Wrapper: Reading, getLoader, clearCache, load, loadAll } = createLoader({
  model: ReadingModel,
  loaderName: 'ReadingLoader',
  isAggregate: true,
  filterMapping: readingFilterMapping,
  viewerCanSee: viewerCanSee as any,
  shouldValidateContextUser: true,
  defaultConditions: ({ user }) => ({ userId: getObjectId(user.id), isActive: true }),
  defaultFilters: { orderBy: [{ field: 'createdAt', direction: -1 }] },
});

registerLoader('ReadingLoader', getLoader);

export const loadMeCanReview = async (context: GraphQLContext, book: IBook) => {
  const { user } = context;

  if (!user) {
    return false;
  }

  const reading = await ReadingModel.findOne({ userId: user._id, bookId: book._id });
  const review = await ReviewModel.findOne({ userId: user._id, bookId: book._id });

  return !review && reading && reading.readPages === book.pages;
};

export { getLoader, clearCache, load, loadAll };

export default Reading;
