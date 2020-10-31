/* eslint-disable no-console */
import 'isomorphic-fetch';

import { koaPlayground } from 'graphql-playground-middleware';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import convert from 'koa-convert';
import cors from '@koa/cors';
import graphqlHttp from 'koa-graphql';
import koaLogger from 'koa-logger';
import Router from '@koa/router';
import idx from 'idx';
import i18next from 'i18next';
import koaI18next from 'koa-i18next';
import NoIntrospection from 'graphql-disable-introspection';
import { GraphQLError } from 'graphql';

import * as graphqlLoaders from '../loader';

import { JWT_KEY } from '../common/config';

import { KoaContextExt } from '../types';

import UserModel, { IUser } from '../modules/user/UserModel';

import { t } from '../locales/helpers';

import appPlatformMiddleware from '../modules/auth/appPlatformMiddleware';
import authMiddleware from '../modules/auth/authMiddleware';

import { getDataloaders } from './helper';
import { schema } from './schema';
import { i18nMiddleware } from './i18n';

const app = new Koa<any, KoaContextExt>();

if (process.env.NODE_ENV === 'production') {
  app.proxy = true;
}
app.keys = [JWT_KEY];

const loaders = graphqlLoaders;

const router = new Router<any, KoaContextExt>();

app.use(bodyParser());

app.on('error', (error) => {
  console.error('Error while answering request', { error });
});

if (process.env.NODE_ENV !== 'test') {
  app.use(koaLogger());
}

app.use(convert(cors({ maxAge: 86400, origin: '*' })));

router.get('/healthz', async (ctx) => {
  try {
    await UserModel.find().lean<IUser>();
    ctx.body = 'Database working';
    ctx.status = 200;
  } catch (err) {
    ctx.body = err.toString();
    ctx.status = 500;
  }
});

if (process.env.NODE_ENV !== 'production') {
  router.all(
    '/playground',
    koaPlayground({
      endpoint: '/graphql',
    }),
  );
}

// Middleware to get dataloaders
app.use(async (ctx, next) => {
  ctx.dataloaders = getDataloaders(loaders);
  await next();
});

app.use(
  koaI18next(i18next, {
    lookupCookie: 'lang', // detecting language in cookie
    order: ['header', 'cookie'],
    next: true,
  }),
);

app.use(i18nMiddleware);

// avoid requests from unknown clients
if (process.env.NODE_ENV !== 'development') {
  app.use(appPlatformMiddleware);
}

// Middleware to get result from authorization token
app.use(authMiddleware);

const graphqlSettingsPerReq = async (request, ctx, koaContext) => {
  const { dataloaders, user } = koaContext;
  const { appplatform, timezone } = request.header;

  if (process.env.NODE_ENV !== 'test') {
    console.info('Handling request', {
      appplatform,
      unauthorized: !user,
      userId: idx(user, (_) => _._id),
    });
  }

  return {
    graphiql: process.env.NODE_ENV !== 'production',
    schema,
    //rootValue: { request: ctx.req },
    validationRules: process.env.NODE_ENV === 'production' ? [NoIntrospection] : [],
    context: {
      user,
      dataloaders,
      appplatform,
      koaContext,
      timezone,
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

      if (process.env.NODE_ENV !== 'production') {
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
