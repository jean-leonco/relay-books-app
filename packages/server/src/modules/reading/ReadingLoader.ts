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

  const reading = await ReadingModel.findOne({ userId: user.id, bookId: book._id, isActive: true });
  const review = await ReviewModel.findOne({ userId: user.id, bookId: book._id, isActive: true });

  const hasReadingAndDoesntHaveReview = reading && !review;
  const hasReadAllBook = reading?.readPages === book.pages;

  return hasReadingAndDoesntHaveReview && hasReadAllBook;
};

export const loadMeLastIncompleteReading = async (context: GraphQLContext) => {
  const { user } = context;

  if (!user) {
    return null;
  }

  const reading = await ReadingModel.aggregate<IReading>([
    {
      $match: {
        userId: getObjectId(user.id),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: 'Book',
        localField: 'bookId',
        foreignField: '_id',
        as: 'book',
      },
    },
    { $unwind: '$book' },
    {
      $match: {
        $expr: {
          $lt: ['$readPages', '$book.pages'],
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    { $limit: 1 },
  ]);

  if (reading.length === 0) {
    return null;
  }

  return load(context, reading[0]._id);
};

export const loadMeHasReading = async (context: GraphQLContext) => {
  const { user } = context;

  if (!user) {
    return false;
  }

  const readingCount = await ReadingModel.countDocuments({ userId: user.id, isActive: true });

  return readingCount > 0;
};

export const loadMeReading = async (context: GraphQLContext, book: IBook) => {
  const { user } = context;

  if (!user) {
    return null;
  }

  const reading = await ReadingModel.findOne({ userId: user.id, bookId: book._id, isActive: true }).lean<IReading>();

  return reading;
};

export { getLoader, clearCache, load, loadAll };

export default Reading;
