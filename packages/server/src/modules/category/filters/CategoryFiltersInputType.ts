import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { buildSortFromArg, FILTER_CONDITION_TYPE } from '@entria/graphql-mongo-helpers';
import { FilterMapping } from '@entria/graphql-mongo-helpers/dist/types';

import {
  StatusDateOrdering,
  StatusDateOrderingInputType,
} from '../../../core/graphql/graphqlFilters/StatusDateOrderingInputType';

import { GraphQLArgFilter } from '../../../types';

export type CategoriesArgFilters = GraphQLArgFilter<{
  orderBy?: StatusDateOrdering[];
}>;

export const categoryFilterMapping: FilterMapping = {
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: StatusDateOrdering[]) => [{ $sort: buildSortFromArg(value) }],
  },
};

const CategoryFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CategoryFilters',
  description: 'Used to filter categories',
  fields: () => ({
    OR: {
      type: GraphQLList(CategoryFiltersInputType),
    },
    AND: {
      type: GraphQLList(CategoryFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(StatusDateOrderingInputType)),
      description: 'Order reviews by StatusDateOrderingInputType.',
    },
  }),
});

export default CategoryFiltersInputType;