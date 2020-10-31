import Application from 'koa';

import { GraphQLContext } from '../../types';
import { getPlatform, PLATFORM } from '../../common/utils';

const appPlatformMiddleware: Application.Middleware<any, GraphQLContext> = async (ctx, next) => {
  if (ctx.request.url === '/healthz') {
    return await next();
  }

  const { appplatform } = ctx.header;
  const platform = getPlatform(appplatform);

  if (platform === PLATFORM.UNKNOWN) {
    ctx.status = 403;
    ctx.body = {
      data: null,
      errors: [{ message: 'Forbidden', severity: 'WARNING' }],
    };

    return;
  }
  return await next();
};

export default appPlatformMiddleware;
