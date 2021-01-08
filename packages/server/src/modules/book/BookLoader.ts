import { createLoader } from '@entria/graphql-mongo-helpers';

import { isLoggedAndDataIsActiveViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

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

export { getLoader, clearCache, load, loadAll };

export default Book;
