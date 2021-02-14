import { FILTER_CONDITION_TYPE, buildSortFromArg, getObjectId } from '@entria/graphql-mongo-helpers';
import { FilterMapping } from '@entria/graphql-mongo-helpers/lib/types';
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import { StatusDateOrdering, StatusDateOrderingInputType } from '../../../graphql/filters/StatusDateOrderingInputType';

import { GraphQLArgFilter, ObjectId } from '../../../types';
import { escapeRegex } from '../../../utils';

export type BooksArgFilters = GraphQLArgFilter<{
  orderBy?: StatusDateOrdering[];
  search?: string;
  category?: ObjectId;
}>;

export const bookFilterMapping: FilterMapping = {
  search: {
    type: FILTER_CONDITION_TYPE.CUSTOM_CONDITION,
    key: 'name',
    format: (value: string) => {
      if (!value) return {};

      const safeSearch = escapeRegex(value);
      const searchRegex = new RegExp(`${safeSearch}`, 'ig');

      return {
        $or: [
          { name: { $regex: searchRegex } },
          { author: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ],
      };
    },
  },
  category: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'categoryId',
    format: (category: string) => getObjectId(category),
  },
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: StatusDateOrdering[]) => [{ $sort: buildSortFromArg(value) }],
  },
};

const BookFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'BookFilters',
  description: 'Used to filter books',
  fields: () => ({
    OR: {
      type: GraphQLList(BookFiltersInputType),
    },
    AND: {
      type: GraphQLList(BookFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(StatusDateOrderingInputType)),
      description: 'Order reviews by StatusDateOrderingInputType.',
    },
    search: {
      type: GraphQLString,
      description: 'Filter by search string. Name, author or description.',
    },
    category: {
      type: GraphQLID,
      description: 'Filter by category.',
    },
    trending: {
      type: GraphQLBoolean,
      description: 'Filter by trending.',
    },
  }),
});

export default BookFiltersInputType;
