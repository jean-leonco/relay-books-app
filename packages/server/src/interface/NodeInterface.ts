import { fromGlobalId } from 'graphql-relay';
import DataLoader from 'dataloader';
import { GraphQLObjectType } from 'graphql';

import { JSObject } from '@booksapp/types';

import * as graphqlLoaders from '../loader';

import { GraphQLContext } from '../types';

import { nodeDefinitions } from './node';

type RegisteredTypes = JSObject<GraphQLObjectType>;

const registeredTypes: RegisteredTypes = {};

export function registerType(type: GraphQLObjectType) {
  registeredTypes[type.name] = type;
  return type;
}

type Loader = {
  load: (context: GraphQLContext, id: string) => Promise<any>;
  getLoader: () => DataLoader<string, any>;
};

const loaders = graphqlLoaders;

const { nodeField, nodesField, nodeInterface } = nodeDefinitions(
  (globalId, context: GraphQLContext) => {
    const { type, id } = fromGlobalId(globalId);
    const loader: Loader = loaders[`${type}Loader`];

    return (loader && loader.load(context, id)) || null;
  },
  (object) => registeredTypes[object.registeredType] || null,
);

export const NodeInterface = nodeInterface;
export const NodeField = nodeField;
export const NodesField = nodesField;
