import { startOfDay, subDays } from 'date-fns';
import { createLoader, NullConnection } from '@entria/graphql-mongo-helpers';
import { connectionFromMongoAggregate } from '@entria/graphql-mongoose-loader';

import { isLoggedAndDataIsActiveViewerCanSee } from '../../security';
import { GraphQLContext } from '../../types';

import { registerLoader } from '../loader/loaderRegister';
import ReadingModel from '../reading/ReadingModel';

import BookModel from './BookModel';
import { bookFilterMapping } from './filters/BookFiltersInputType';

const { Wrapper: Book, getLoader, clearCache, load, loadAll } = createLoader({
  model: BookModel,
  loaderName: 'BookLoader',
  isAggregate: true,
  filterMapping: bookFilterMapping,
  viewerCanSee: isLoggedAndDataIsActiveViewerCanSee as any,
  shouldValidateContextUser: true,
  defaultConditions: { isActive: true },
  defaultFilters: (_ctx, args) => (args.filters?.trending ? {} : { orderBy: [{ field: 'createdAt', direction: -1 }] }),
});

registerLoader('BookLoader', getLoader);

// Improvement over old approach, but still needs some tweaks to handle a lot of readings
export const loadTrendingBooks = async (context: GraphQLContext) => {
  if (!context.user) {
    return NullConnection;
  }

  const today = startOfDay(new Date());
  const start = subDays(today, 7);

  const aggregate = ReadingModel.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$bookId',
        readingsCount: { $sum: 1 },
      },
    },
    { $sort: { readingsCount: -1 } },
  ]);

  return connectionFromMongoAggregate({
    aggregate,
    context,
    args: {},
    loader: load as any,
  });
};

export { getLoader, clearCache, load, loadAll };

export default Book;
