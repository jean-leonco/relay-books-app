import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLID } from 'graphql';
import { buildSortFromArg, FILTER_CONDITION_TYPE, getObjectId } from '@entria/graphql-mongo-helpers';
import { FilterMapping } from '@entria/graphql-mongo-helpers/lib/types';

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
          $project: {
            finished: {
              $switch: {
                branches: [{ case: { $eq: ['$readPages', '$book.pages'] }, then: true }],
                default: false,
              },
            },
          },
        },
        // @TODO - discover why the match directly is not working { $match: { readPages: '$book.pages' } }
        {
          $match: {
            finished,
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
