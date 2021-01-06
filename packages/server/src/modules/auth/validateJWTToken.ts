import jwt, { TokenExpiredError } from 'jsonwebtoken';

import { JWT_KEY } from '../../config';
import { GraphQLContext } from '../../types';

import { t } from '../../locales/helpers';

import TokenModel, { IToken, TOKEN_SCOPES } from '../token/TokenModel';

export interface DecodedToken {
  id?: string;
  scope?: TOKEN_SCOPES;
  token?: string;
  expired?: boolean;
  iat?: number;
}

interface ValidateTokenResult {
  token: DecodedToken | null;
  expired?: boolean;
  error?: string;
  abortRequest?: boolean;
  status?: number;
}

const validateJWTToken = async (context: GraphQLContext, token: string): Promise<ValidateTokenResult> => {
  try {
    const decodedToken: DecodedToken | string = jwt.verify(token, JWT_KEY);

    if (decodedToken == null) {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    if (typeof decodedToken === 'string') {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    if (!decodedToken.id || !decodedToken.scope || !decodedToken.token) {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    const sessionToken = await TokenModel.findOne({
      _id: decodedToken.token,
      userId: decodedToken.id,
      scope: decodedToken.scope,
      isActive: true,
      isBlocked: false,
    }).lean<IToken>();

    if (!sessionToken) {
      return {
        token: null,
        error: t('auth', 'InvalidSession'),
        status: 401,
        abortRequest: true,
      };
    }

    if (sessionToken.scope !== decodedToken.scope) {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    return { token: decodedToken };
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return {
        token: null,
        expired: true,
        error: t('auth', 'TokenExpired'),
        status: 401,
        abortRequest: true,
      };
    }

    if (err.message === 'invalid signature') {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    if (err.name === 'JsonWebTokenError' || err.message === 'invalid token') {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    return {
      token: null,
      error: t('auth', 'TokenInvalid'),
      status: 403,
      abortRequest: true,
    };
  }
};

export default validateJWTToken;
