---
to: packages/<%=package%>/src/<%=dir%>/mutations/<%= h.inflection.camelize(name) %>AddMutation.ts
---
import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import <%= h.inflection.camelize(name) %>Model from '../<%= h.inflection.camelize(name) %>Model';

import * as <%= h.inflection.camelize(name) %>Loader from '../<%= h.inflection.camelize(name) %>Loader';
import { <%= h.inflection.camelize(name) %>Connection } from '../<%= h.inflection.camelize(name) %>Type';

import errorField from '../../../core/graphql/errorField';

import { LoggedGraphQLContext } from '../../../types';

type <%= h.inflection.camelize(name) %>AddArgs = {
  name: string;
  description?: string;
};

const mutation = mutationWithClientMutationId({
  name: '<%= h.inflection.camelize(name) %>Add',
  inputFields: {
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    description: {
      type: GraphQLString,
    },
  },
  mutateAndGetPayload: async (args: <%= h.inflection.camelize(name) %>AddArgs, context: LoggedGraphQLContext) => {
    const { name, description } = args;

    const <%= name %> = await new <%= h.inflection.camelize(name) %>Model({
      name,
      description,
    }).save();

    // @TODO: mutation logic

    return {
      id: <%= name %>._id,
      error: null,
    };
  },
  outputFields: {
    <%= name %>Edge: {
      type: <%= h.inflection.camelize(name) %>Connection.edgeType,
      resolve: async ({ id }, args, context) => {
        const <%= name %> = await <%= h.inflection.camelize(name) %>Loader.load(context, id);

        if (!<%= name %>) {
          return null;
        }

        return {
          cursor: toGlobalId('<%= h.inflection.camelize(name) %>', <%= name %>._id),
          node: <%= name %>,
        };
      },
    },
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};