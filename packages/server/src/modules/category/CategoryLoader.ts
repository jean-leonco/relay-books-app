import { createLoader } from '@entria/graphql-mongo-helpers';

import { isLoggedAndDataIsActiveViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import CategoryModel from './CategoryModel';
import { categoryFilterMapping } from './filters/CategoryFiltersInputType';

const { Wrapper: Category, getLoader, clearCache, load, loadAll } = createLoader({
  model: CategoryModel,
  loaderName: 'CategoryLoader',
  isAggregate: true,
  filterMapping: categoryFilterMapping,
  viewerCanSee: isLoggedAndDataIsActiveViewerCanSee as any,
  shouldValidateContextUser: true,
  defaultConditions: { isActive: true },
  defaultFilters: { orderBy: [{ field: 'createdAt', direction: -1 }] },
});

registerLoader('CategoryLoader', getLoader);

export { getLoader, clearCache, load, loadAll };

export default Category;
