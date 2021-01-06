import Application from 'koa';

import { GraphQLContext } from '../../types';
import { t } from '../../locales/helpers';

import { auth } from './sessionManagement';

const authMiddleware: Application.Middleware<any, GraphQLContext> = async (context, next) => {
  const { abortRequest, unauthorized, user, error, status: resultStatus } = await auth(context);
  const status = resultStatus ? resultStatus : error ? 401 : 200;

  if (abortRequest || unauthorized) {
    context.status = status;

    context.body = {
      data: null,
      errors: [{ message: error || t('auth', 'InvalidSession'), severity: 'WARNING' }],
    };
    return;
  }

  context.user = user;

  return next();
};

export default authMiddleware;
