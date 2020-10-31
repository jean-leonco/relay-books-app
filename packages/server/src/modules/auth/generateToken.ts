import jwt from 'jsonwebtoken';
import { addMinutes, addSeconds } from 'date-fns';

import { SESSION_TOKEN_SCOPES, IUser, SessionToken, ISessionToken } from '../../models';
import { GraphQLContext } from '../../types';

import { JWT_KEY } from '../../common/config';

const twelveHoursInMinutes = 60 * 12;

export const getExpirationTimeByScope = (scope: string): number | null => {
  if (Object.values(SESSION_TOKEN_SCOPES).indexOf(scope) === -1) {
    return null;
  }

  switch (scope) {
    case SESSION_TOKEN_SCOPES.SESSION:
      return null;
    case SESSION_TOKEN_SCOPES.RESET_PASSWORD:
      return twelveHoursInMinutes;
    default:
      return null;
  }
};

export const jwtSign = (sessionToken: ISessionToken, secondsToExpire?: number): string => {
  const expiresIn = secondsToExpire || getExpirationTimeByScope(sessionToken.scope);

  return jwt.sign(
    {
      id: sessionToken.user ? sessionToken.user : sessionToken.ip,
      scope: sessionToken.scope,
      sessionToken: sessionToken._id,
    },
    JWT_KEY,
    expiresIn ? { expiresIn: expiresIn * 60 } : {},
  );
};

export const generateToken = async (
  ctx: GraphQLContext,
  user: IUser | null,
  channel: string,
  scope: string,
  expiresIn?: number, // in seconds
): Promise<string | null> => {
  const { koaContext } = ctx;

  const { ip } = koaContext.request;
  const scopeExpirationTime = getExpirationTimeByScope(scope); // in minutes
  const scopeExpiresIn = scopeExpirationTime ? addMinutes(new Date(), scopeExpirationTime) : null;

  let sessionToken;

  // only reuse tokens that has user and the scope is SESSION
  if (user && scope === SESSION_TOKEN_SCOPES.SESSION) {
    sessionToken = await SessionToken.findOne({
      user: user._id,
      ip,
      channel,
      scope,
      isActive: true,
      isBlocked: false,
    }).lean<ISessionToken>();
  }

  if (sessionToken) {
    sessionToken = await SessionToken.findOneAndUpdate(
      { _id: sessionToken._id },
      { expiresIn: expiresIn ? addSeconds(new Date(), expiresIn) : scopeExpiresIn },
    ).lean<ISessionToken>();
  } else {
    sessionToken = await new SessionToken({
      ...(user ? { user: user._id } : {}),
      ip,
      channel,
      scope,
      expiresIn: expiresIn ? addSeconds(new Date(), expiresIn) : scopeExpiresIn,
    }).save();
  }

  return jwtSign(sessionToken!, expiresIn);
};

export const hasReachedMaximumNumberOfSessions = async (user: IUser, scope: string, numberOfSessions: number) => {
  const sessions = await SessionToken.find({
    user: user._id,
    scope,
    isActive: true,
    expiresIn: { $gte: new Date() },
  }).lean();

  return sessions.length >= numberOfSessions;
};
