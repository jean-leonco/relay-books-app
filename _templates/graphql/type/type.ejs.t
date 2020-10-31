---
to: packages/<%=package%>/src/<%=dir%>/<%= h.inflection.camelize(name) %>Type.ts
---
import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLNonNull } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { registerType, NodeInterface } from '../../interface/NodeInterface';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';
import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import <%= h.inflection.camelize(name) %> from './<%= h.inflection.camelize(name) %>Loader';

type ConfigType = GraphQLObjectTypeConfig<<%= h.inflection.camelize(name) %>, GraphQLContext>;

const <%= h.inflection.camelize(name) %>TypeConfig: ConfigType = {
  name: '<%= h.inflection.camelize(name) %>',
  description: 'Represents a <%= h.inflection.camelize(name) %>',
  fields: () => ({
    id: globalIdField('<%= h.inflection.camelize(name) %>'),
    ...mongooseIdResolver,
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const <%= h.inflection.camelize(name) %>Type = registerType(new GraphQLObjectType(<%= h.inflection.camelize(name) %>TypeConfig));

export const <%= h.inflection.camelize(name) %>Connection = connectionDefinitions({
  name: '<%= h.inflection.camelize(name) %>',
  nodeType: GraphQLNonNull(<%= h.inflection.camelize(name) %>Type),
});

export default <%= h.inflection.camelize(name) %>Type;