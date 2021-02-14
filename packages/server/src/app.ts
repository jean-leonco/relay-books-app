/* eslint-disable no-console */

import cors from '@koa/cors';
import Router from '@koa/router';
import { GraphQLError } from 'graphql';
import { koaPlayground } from 'graphql-playground-middleware';
import i18next from 'i18next';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import graphqlHttp from 'koa-graphql';
import koaI18next from 'koa-i18next';
import logger from 'koa-logger';

import { NODE_ENV, isProduction } from './config';

import { i18nMiddleware } from './i18n';
import { t } from './locales/helpers';
import appPlatformMiddleware from './modules/auth/appPlatformMiddleware';
import authMiddleware from './modules/auth/authMiddleware';
import { getDataloaders } from './modules/loader/loaderRegister';
import schema from './schema/schema';
import { KoaContext } from './types';

const app = new Koa<any, KoaContext>();
const router = new Router<any, KoaContext>();

app.use(bodyParser());
app.use(cors());

app.on('error', (error) => {
  console.error('Error while answering request', { error });
});

if (isProduction) {
  app.proxy = true;
}

if (NODE_ENV !== 'test') {
  app.use(logger());
}

if (!isProduction) {
  router.all('/playground', koaPlayground({ endpoint: '/graphql' }));
}

app.use(async (ctx, next) => {
  ctx.dataloaders = getDataloaders();
  await next();
});

app.use(
  koaI18next(i18next, {
    lookupCookie: 'lang',
    order: ['header', 'cookie'],
    next: true,
  }),
);

app.use(i18nMiddleware);

if (NODE_ENV !== 'development') {
  app.use(appPlatformMiddleware);
}

app.use(authMiddleware);

const graphqlSettingsPerReq = (request, ctx, koaContext) => {
  const { dataloaders, user } = koaContext;
  const { appplatform } = request.header;

  return {
    graphiql: !isProduction,
    schema,
    context: {
      user,
      dataloaders,
      koaContext,
      appplatform,
      t,
    },
    formatError: (error: GraphQLError) => {
      if (error.name && error.name === 'BadRequestError') {
        ctx.status = 400;
        ctx.body = 'Bad Request';
        return {
          message: 'Bad Request',
        };
      }

      if (error.path || error.name !== 'GraphQLError') {
        console.error(error);
      } else {
        console.log(`GraphQLWrongQuery: ${error.message}`);
      }

      console.error('GraphQL Error', { error });

      if (!isProduction) {
        return {
          message: error.message,
          locations: error.locations,
          stack: error.stack,
        };
      } else {
        ctx.status = 400;
        ctx.body = 'Bad Request';
        return {
          message: 'Bad Request',
        };
      }
    },
  };
};

const graphqlServer = graphqlHttp(graphqlSettingsPerReq);
router.all('/graphql', graphqlServer);

app.use(router.routes()).use(router.allowedMethods());

export default app;
