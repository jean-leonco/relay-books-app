import jwt from 'jsonwebtoken';
import { addMinutes, addSeconds } from 'date-fns';

import { JWT_KEY } from '../../config';
import { GraphQLContext } from '../../types';
import { PLATFORM } from '../../security';

import { IUser } from '../user/UserModel';
import TokenModel, { IToken, TOKEN_SCOPES } from '../token/TokenModel';

export const getExpirationTimeByScope = (scope: TOKEN_SCOPES): number | null => {
  if (Object.values(TOKEN_SCOPES).indexOf(scope) === -1) {
    return null;
  }

  switch (scope) {
    case TOKEN_SCOPES.SESSION:
      return null;
    default:
      return null;
  }
};

export const jwtSign = (token: IToken, secondsToExpire?: number): string => {
  const expiresIn = secondsToExpire || getExpirationTimeByScope(token.scope);

  return jwt.sign(
    {
      id: token.userId ? token.userId : token.ip,
      scope: token.scope,
      token: token._id,
    },
    JWT_KEY,
    expiresIn ? { expiresIn: expiresIn * 60 } : {},
  );
};

interface GenerateTokenProps {
  ctx: GraphQLContext;
  user: IUser | null;
  scope: TOKEN_SCOPES;
  platform: PLATFORM;
  expiresIn?: number; // in seconds
}

export const generateToken = async ({
  ctx,
  user,
  scope,
  platform,
  expiresIn,
}: GenerateTokenProps): Promise<string | null> => {
  const { koaContext } = ctx;
  const { ip } = koaContext.request;

  const scopeExpirationTime = getExpirationTimeByScope(scope); // in minutes
  const scopeExpiresIn = scopeExpirationTime ? addMinutes(new Date(), scopeExpirationTime) : null;

  let token: IToken | null = null;

  // only reuse tokens that has user and the scope is SESSION
  if (user && scope === TOKEN_SCOPES.SESSION) {
    token = await TokenModel.findOne({
      userId: user._id,
      ip,
      platform,
      scope,
      isActive: true,
      isBlocked: false,
    }).lean<IToken>();
  }

  if (!token) {
    token = await new TokenModel({
      ...(user ? { userId: user._id } : {}),
      ip,
      platform,
      scope,
      expiresIn: expiresIn ? addSeconds(new Date(), expiresIn) : scopeExpiresIn,
    }).save();
  }

  return jwtSign(token, expiresIn);
};

export const hasReachedMaximumNumberOfSessions = async (user: IUser, scope: TOKEN_SCOPES, numberOfSessions: number) => {
  const sessionCount = await TokenModel.countDocuments({
    userId: user._id,
    scope,
    isActive: true,
    expiresIn: { $gte: new Date() },
  });

  return sessionCount >= numberOfSessions;
};
