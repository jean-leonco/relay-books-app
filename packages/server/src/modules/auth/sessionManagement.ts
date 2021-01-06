import { ParameterizedContext } from 'koa';

import { t } from '../../locales/helpers';

import { GraphQLContext } from '../../types';
import { TOKEN_SCOPES } from '../token/TokenModel';

import User, * as UserLoader from '../user/UserLoader';

import validateJWTToken from './validateJWTToken';

interface AuthorizationHeader {
  token: null | string;
  error: string | null;
}

export interface ContextFromTokenResult {
  user: User | null;
  error?: string | null;
  abortRequest: boolean;
  unauthorized: boolean;
  status?: number;
}

const parseAuthorizationHeader = (token: string | null): AuthorizationHeader => {
  if (!token || token === 'null' || token === 'undefined') {
    return { token: null, error: null };
  }

  if (!token.match(/JWT /)) {
    return {
      token: null,
      error: t('auth', 'TokenInvalid'),
    };
  }

  const cleanToken = token.replace(/^JWT /, '').trim();

  if (cleanToken === '[object Object]') {
    return {
      token: null,
      error: t('auth', 'TokenInvalid'),
    };
  }

  return { token: cleanToken, error: null };
};

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
      status: decodedToken.status,
    };
  }

  const { token } = decodedToken;

  // do not try to create session if it isn't a session token
  if (!token.scope || token.scope !== TOKEN_SCOPES.SESSION) {
    return {
      ...defaultInvalidToken,
      error: t('auth', 'TokenInvalid'),
      status: 401,
    };
  }

  try {
    const user = await UserLoader.load(ctx, token.id, true);

    if (!user) {
      return {
        ...defaultInvalidToken,
        error: t('auth', 'TokenInvalid'),
        status: 403,
      };
    }

    if (!user.isActive) {
      return {
        ...defaultInvalidToken,
        error: t('auth', 'TokenInvalid'),
        status: 401,
      };
    }

    return { ...defaultReturn, user };
  } catch (err) {
    return defaultInvalidToken;
  }
};

export const auth = async (ctx: ParameterizedContext & GraphQLContext): Promise<ContextFromTokenResult> => {
  const { authorization } = ctx.header;

  const authHeader = parseAuthorizationHeader(authorization);

  if (authHeader.error) {
    return {
      user: null,
      error: authHeader.error,
      abortRequest: true,
      unauthorized: true,
    };
  }

  return getUser(ctx, authHeader.token);
};
