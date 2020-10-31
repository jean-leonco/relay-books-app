import jwt, { TokenExpiredError } from 'jsonwebtoken';

import { GraphQLContext } from '../../types';

import { SessionToken, ISessionToken } from '../../models';

import { JWT_KEY } from '../../common/config';
import { t } from '../../locales/helpers';

export interface DecodedToken {
  id?: string;
  scope?: string;
  sessionToken?: string;
  expired?: boolean;
  iat?: number;
}

interface ValidateTokenResult {
  token: DecodedToken | null;
  expired?: boolean;
  error?: string;
  detailedError?: string;
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
        detailedError: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    if (typeof decodedToken === 'string') {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        detailedError: t('auth', 'TokenInvalid'),
        status: 403,
        abortRequest: true,
      };
    }

    if (!decodedToken.id || !decodedToken.scope || !decodedToken.sessionToken) {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        detailedError: t('auth', 'TokenInvalidSession'),
        status: 403,
        abortRequest: true,
      };
    }

    const sessionToken = await SessionToken.findOne({
      _id: decodedToken.sessionToken,
      user: decodedToken.id,
      scope: decodedToken.scope,
      isActive: true,
      isBlocked: false,
    }).lean<ISessionToken>();

    if (!sessionToken) {
      return {
        token: null,
        error: t('auth', 'InvalidSession'),
        detailedError: t('auth', 'InvalidSessionDetailed'),
        status: 401,
        abortRequest: true,
      };
    }

    if (sessionToken.scope !== decodedToken.scope) {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        detailedError: t('auth', 'InvalidSessionScope'),
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
        detailedError: t('auth', 'TokenExpiredDetailed', { expired: err.expiredAt }),
        status: 401,
        abortRequest: true,
      };
    }

    if (err.message === 'invalid signature') {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        detailedError: t('auth', 'TokenInvalidSignature'),
        status: 403,
        abortRequest: true,
      };
    }

    if (err.name === 'JsonWebTokenError' || err.message === 'invalid token') {
      return {
        token: null,
        error: t('auth', 'TokenInvalid'),
        detailedError: t('auth', 'TokenInvalidSignature'),
        status: 403,
        abortRequest: true,
      };
    }

    return {
      token: null,
      error: t('auth', 'TokenInvalid'),
      detailedError: t('auth', 'TokenUnknownError'),
      status: 403,
      abortRequest: true,
    };
  }
};

export default validateJWTToken;
