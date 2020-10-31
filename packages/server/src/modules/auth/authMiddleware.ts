import Application from 'koa';
import i18next from 'i18next';

import { GraphQLContext } from '../../types';

import { auth } from './sessionManagement';

const authMiddleware: Application.Middleware<any, GraphQLContext> = async (context, next) => {
  const { t } = context;

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

  if (user?.lang && i18next.isInitialized) await i18next.changeLanguage(user?.lang);

  return await next();
};

export default authMiddleware;
