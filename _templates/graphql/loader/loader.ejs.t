---
to: packages/<%=package%>/src/<%=dir%>/<%= h.inflection.camelize(name) %>Loader.ts
---
import DataLoader from 'dataloader';
import { connectionFromMongoCursor, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { Types } from 'mongoose';

import { GraphQLContext, DataLoaderKey } from '../../types';

import <%= h.inflection.camelize(name) %>Model, { I<%= h.inflection.camelize(name) %> } from './<%= h.inflection.camelize(name) %>Model';

export default class <%= h.inflection.camelize(name) %> {
  public registeredType = '<%= h.inflection.camelize(name) %>';

  id: string;
  _id: Types.ObjectId;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: I<%= h.inflection.camelize(name) %>) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.isActive = data.isActive;
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader(ids => mongooseLoader(<%= h.inflection.camelize(name) %>Model, ids));

const viewerCanSee = (context: GraphQLContext, data: I<%= h.inflection.camelize(name) %>) => {
  if (!context.user) {
    return false;
  }

  if (!data.isActive || data.removedAt) {
    return false;
  }

  return true;
}

export const load = async (context: GraphQLContext, id: DataLoaderKey) => {
  if (!id) return null;

  try {
    const data = await context.dataloaders.<%= h.inflection.camelize(name) %>Loader.load(id);

    if (!data) return null;

    return viewerCanSee(context, data) ? new <%= h.inflection.camelize(name) %>(data) : null;
  } catch (err) {
    console.log('<%= h.inflection.camelize(name) %>Loader load err:', err);
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) =>
  dataloaders.<%= h.inflection.camelize(name) %>Loader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: string, data: I<%= h.inflection.camelize(name) %>) =>
  dataloaders.<%= h.inflection.camelize(name) %>Loader?.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: string, data: I<%= h.inflection.camelize(name) %>) =>
  clearCache(context, id) && primeCache(context, id, data);

export const load<%= h.inflection.camelize(name) %>s = async (context: GraphQLContext, args: ConnectionArguments) => {
  // @TODO: specify conditions
  const <%= name %> = <%= h.inflection.camelize(name) %>Model.find({});

  return connectionFromMongoCursor({
    cursor: <%= name %>,
    context,
    args,
    loader: load,
  });
};