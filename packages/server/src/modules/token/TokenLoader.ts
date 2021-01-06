import DataLoader from 'dataloader';
import { isPast } from 'date-fns';
import { mongooseLoader } from '@entria/graphql-mongoose-loader';

import { DataLoaderKey, GraphQLContext, ObjectId } from '../../types';
import { isLoggedViewerCanSee, PLATFORM } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import { IUser } from '../user/UserModel';

import TokenModel, { IToken, TOKEN_SCOPES } from './TokenModel';

export default class Token {
  public registeredType = 'Token';

  id: string;
  _id: ObjectId;
  userId?: ObjectId;
  ip: string;
  scope: string;
  expiresIn: Date | null;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IToken, context: GraphQLContext) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.userId = data.userId;
    this.ip = data.ip;
    this.scope = data.scope;
    this.expiresIn = data.expiresIn;
    this.isBlocked = data.isBlocked;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader<DataLoaderKey, IToken>((ids) => mongooseLoader(TokenModel, ids));

registerLoader('TokenLoader', getLoader);

export const load = async (context: GraphQLContext, id: DataLoaderKey, isLogin?: boolean) => {
  if (!id) {
    return null;
  }

  try {
    const data = await context.dataloaders.TokenLoader.load(id);

    if (!data) {
      return null;
    }

    if (isLogin) {
      return new Token(data, context);
    }

    return isLoggedViewerCanSee(context, data) ? new Token(data, context) : null;
  } catch (err) {
    return null;
  }
};

interface LoadValidTokenProps {
  ctx: GraphQLContext;
  user: IUser;
  platform: PLATFORM;
  scope: TOKEN_SCOPES;
}

export const loadValidToken = async ({ ctx, user, platform, scope }: LoadValidTokenProps) => {
  const { koaContext } = ctx;
  const { ip } = koaContext.request;

  const token = await TokenModel.findOne({
    userId: user._id,
    ip,
    scope,
    platform,
    isBlocked: false,
    isActive: true,
  }).lean<IToken>();

  if (!token) {
    return null;
  }

  const hasExpired = token.expiresIn ? isPast(token.expiresIn) : false;

  if (hasExpired) {
    return null;
  }

  return new Token(token, ctx);
};
