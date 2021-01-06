import { DirectionEnumType } from '@entria/graphql-mongo-helpers';
import { GraphQLInputObjectType, GraphQLNonNull, GraphQLEnumType } from 'graphql';

import { GraphqlSortArg } from '../../types';

type StatusDateSort = 'createdAt' | 'updatedAt';

type StatusDateOrdering = GraphqlSortArg<StatusDateSort>;

const dateFields = {
  CREATED_AT: {
    value: 'createdAt',
    description: 'The creation date.',
  },
  UPDATED_AT: {
    value: 'updatedAt',
    description: 'The last date that the document was updated',
  },
};

const StatusDateEnumType = new GraphQLEnumType({
  name: 'StatusDateSortEnumType',
  values: dateFields,
});

const StatusDateOrderingInputType = new GraphQLInputObjectType({
  name: 'StatusDateOrdering',
  description: 'Used to order by createdAt or updatedAt.',
  fields: () => ({
    field: {
      type: new GraphQLNonNull(StatusDateEnumType),
      description: 'the field used to sort. Ex: CREATED_AT.',
    },
    direction: {
      type: new GraphQLNonNull(DirectionEnumType),
      description: 'the direction used to sort. Ex: ASC.',
    },
  }),
});

export { StatusDateSort, StatusDateOrdering, StatusDateEnumType, StatusDateOrderingInputType, dateFields };
