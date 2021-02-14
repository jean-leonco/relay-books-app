import { FILTER_CONDITION_TYPE, buildSortFromArg } from '@entria/graphql-mongo-helpers';
import { FilterMapping } from '@entria/graphql-mongo-helpers/lib/types';
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { StatusDateOrdering, StatusDateOrderingInputType } from '../../../graphql/filters/StatusDateOrderingInputType';

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
