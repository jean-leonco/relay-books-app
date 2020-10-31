import DataLoader from 'dataloader';
import { Types } from 'mongoose';
import { isPast } from 'date-fns';

import { connectionFromMongoCursor, mongooseLoader } from '@entria/graphql-mongoose-loader';

import { GraphQLContext } from '../../types';

import { IUser } from '../user/UserModel';

import SessionTokenModel, { ISessionToken } from './SessionTokenModel';

export default class SessionToken {
  public registeredType = 'SessionToken';

  id: string;
  _id: Types.ObjectId;
  user: Types.ObjectId;
  ip: string;
  channel: string;
  scope: string;
  isActive: boolean;
  isBlocked: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  expiresIn: Date | null;

  constructor(data: ISessionToken) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.user = data.user;
    this.ip = data.ip;
    this.channel = data.channel;
    this.scope = data.scope;
    this.isActive = data.isActive;
    this.isBlocked = data.isBlocked;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.expiresIn = data.expiresIn;
  }
}

export const getLoader = () => new DataLoader(ids => mongooseLoader(SessionTokenModel, ids));

// @TODO - improve this
const viewerCanSee = () => true;

export const load = async (context: GraphQLContext, id: string) => {
  if (!id) {
    return null;
  }

  try {
    const data = await context.dataloaders.SessionTokenLoader.load(id.toString());

    if (!data) {
      return null;
    }

    return viewerCanSee() ? new SessionToken(data) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) =>
  dataloaders.SessionTokenLoader.clear(id.toString());

// @TODO - do not query with isBlocked so we can validate if exists a session token
// blocked for this user and abort token generation process
export const loadValidSessionToken = async (
  ctx: GraphQLContext,
  user: IUser,
  channel: string,
  scope: string,
): Promise<ISessionToken | null> => {
  const { koaContext } = ctx;

  const { ip } = koaContext.request;
  const session = await SessionTokenModel.findOne({
    user: user._id,
    ip,
    channel,
    scope,
    isActive: true,
    isBlocked: false,
  }).lean<ISessionToken>();

  if (!session || isPast(session.expiresIn!)) return null;

  return session;
};

type SessionTokenArgs = {};

export const loadAll = async (context: GraphQLContext, args: SessionTokenArgs) => {
  const sessionTokens = SessionTokenModel.find().sort({ createdAt: -1 });

  return connectionFromMongoCursor({
    cursor: sessionTokens,
    context,
    args,
    loader: load,
  });
};

export const loadSessionTokensByIp = async (context: GraphQLContext, args: SessionTokenArgs, ip: string) => {
  const sessionTokens = SessionTokenModel.find({ ip }).sort({ createdAt: -1 });

  return connectionFromMongoCursor({
    cursor: sessionTokens,
    context,
    args,
    loader: load,
  });
};

export const loadSessionTokensByUser = async (context: GraphQLContext, args: SessionTokenArgs, user: string) => {
  const sessionTokens = SessionTokenModel.find({ user }).sort({ createdAt: -1 });

  return connectionFromMongoCursor({
    cursor: sessionTokens,
    context,
    args,
    loader: load,
  });
};
