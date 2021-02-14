import { FILTER_CONDITION_TYPE, buildSortFromArg, getObjectId } from '@entria/graphql-mongo-helpers';
import { FilterMapping } from '@entria/graphql-mongo-helpers/lib/types';
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { StatusDateOrdering, StatusDateOrderingInputType } from '../../../graphql/filters/StatusDateOrderingInputType';

import { GraphQLArgFilter, ObjectId } from '../../../types';

export type ReadingsArgFilters = GraphQLArgFilter<{
  orderBy?: StatusDateOrdering[];
  book?: ObjectId;
}>;

export const readingFilterMapping: FilterMapping = {
  book: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'bookId',
    format: (book: string) => getObjectId(book),
  },
  finished: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (finished: boolean) => {
      const expressionOperator = finished ? '$eq' : '$lt';

      return [
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
              [expressionOperator]: ['$readPages', '$book.pages'],
            },
          },
        },
      ];
    },
  },
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: StatusDateOrdering[]) => [{ $sort: buildSortFromArg(value) }],
  },
};

const ReadingsFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ReadingFilters',
  description: 'Used to filter readings',
  fields: () => ({
    OR: {
      type: GraphQLList(ReadingsFiltersInputType),
    },
    AND: {
      type: GraphQLList(ReadingsFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(StatusDateOrderingInputType)),
      description: 'Order reviews by StatusDateOrderingInputType.',
    },
    finished: {
      type: GraphQLBoolean,
      description: 'Filter by book finished status.',
    },
    book: {
      type: GraphQLID,
      description: 'Filter by book.',
    },
  }),
});

export default ReadingsFiltersInputType;
