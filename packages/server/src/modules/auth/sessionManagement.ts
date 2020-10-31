import { ParameterizedContext } from 'koa';

import { GraphQLContext } from '../../types';
import { SESSION_TOKEN_SCOPES } from '../../models';
import { User, UserLoader } from '../../loader';

import { t } from '../../locales/helpers';

import validateJWTToken from './validateJWTToken';

interface AuthorizationHeader {
  token: null | string;
  error: string | null;
  detailedError: string | null;
}

export interface ContextFromTokenResult {
  user: User | null;
  error?: string | null;
  detailedError?: string | null;
  abortRequest: boolean;
  unauthorized: boolean;
  status?: number;
}

export function parseAuthorizationHeader(token: string | null): AuthorizationHeader {
  if (!token || token === 'null' || token === 'undefined') {
    return { token: null, error: null, detailedError: null };
  }

  if (!token.match(/JWT /)) {
    return {
      token: null,
      error: t('auth', 'TokenInvalid'),
      detailedError: t('auth', 'TokenAuthHeaderMissingJwt'),
    };
  }

  const cleanToken = token.replace(/^JWT /, '').trim();

  if (cleanToken === '[object Object]') {
    return {
      token: null,
      error: t('auth', 'TokenInvalid'),
      detailedError: t('auth', 'TokenAuthHeader'),
    };
  }

  return { token: cleanToken, error: null, detailedError: null };
}

export const getUser = async (
  ctx: ParameterizedContext & GraphQLContext,
  authorization: string | null,
): Promise<ContextFromTokenResult> => {
  const defaultReturn = { user: null, abortRequest: false, unauthorized: false };

  const defaultInvalidToken = { user: null, abortRequest: true, unauthorized: true };

  if (!authorization) {
    return defaultReturn;
  }

  const decodedToken = await validateJWTToken(ctx, authorization);
  if (!decodedToken.token || decodedToken.error) {
    return {
      ...defaultInvalidToken,
      error: decodedToken.error,
      detailedError: decodedToken.detailedError,
      status: decodedToken.status,
    };
  }

  const { token } = decodedToken;

  const validSessions = Object.values(SESSION_TOKEN_SCOPES);

  // do not try to create session if it isn't a session token
  if (!token.scope || !validSessions.includes(token.scope)) {
    return { ...defaultReturn, unauthorized: true };
  }

  if (token.scope !== SESSION_TOKEN_SCOPES.SESSION) {
    return {
      ...defaultInvalidToken,
      error: t('auth', 'TokenInvalid'),
      detailedError: t('auth', 'InvalidSessionScope'),
      status: 401,
    };
  }

  try {
    const user = await UserLoader.load(ctx, token.id, true);

    if (!user) {
      return {
        ...defaultInvalidToken,
        error: t('auth', 'TokenInvalid'),
        detailedError: t('auth', 'UserNotFound'),
        status: 403,
      };
    }

    if (!user.isActive || user.removedAt) {
      return {
        ...defaultInvalidToken,
        error: t('auth', 'TokenInvalid'),
        detailedError: !user.isActive ? t('auth', 'UserDeactivated') : t('auth', 'UserNotFound'),
        status: 401,
      };
    }

    return { ...defaultReturn, user };
  } catch (err) {
    return defaultInvalidToken;
  }
};

export async function auth(ctx: ParameterizedContext & GraphQLContext): Promise<ContextFromTokenResult> {
  const { authorization } = ctx.header;

  const authHeader = parseAuthorizationHeader(authorization);

  if (authHeader.error) {
    return {
      user: null,
      error: authHeader.error,
      detailedError: authHeader.detailedError,
      abortRequest: true,
      unauthorized: true,
    };
  }

  return await getUser(ctx, authHeader.token);
}
