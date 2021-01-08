import { createLoader, DataLoaderKey } from '@entria/graphql-mongo-helpers';
import { isPast } from 'date-fns';

import { GraphQLContext } from '../../types';
import { isLoggedAndDataIsActiveViewerCanSee, PLATFORM } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import { IUser } from '../user/UserModel';

import TokenModel, { IToken, TOKEN_SCOPES } from './TokenModel';

const { Wrapper: Token, getLoader } = createLoader({
  model: TokenModel,
  loaderName: 'TokenLoader',
});

const load = async (context: GraphQLContext, id: DataLoaderKey, isLogin?: boolean) => {
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

    return isLoggedAndDataIsActiveViewerCanSee(context, data) ? new Token(data, context) : null;
  } catch (err) {
    return null;
  }
};

registerLoader('TokenLoader', getLoader);

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

export { getLoader, load };

export default Token;
