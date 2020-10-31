import i18next from 'i18next';

import { getDataloaders } from '../src/graphql/helper';

import { IUser } from '../src/models';

import * as graphqlLoaders from '../src/loader';
import { User } from '../src/loader';
import { GraphQLContext } from '../src/types';

import { t } from '../src/locales/helpers';

import en from '../src/locales/en';

// initialize i18n
i18next.init({
  lng: 'en',
  resources: { en: en },
  nsSeparator: '::',
});

const origin = 'http://127.0.0.1';

interface ContextVars {
  user?: IUser;
  timezone?: string;
  appplatform?: 'APP';
}

export const getContext = async (ctx: ContextVars = {}): Promise<GraphQLContext> => {
  // create context
  const context = { ...ctx };

  // register loaders
  const dataloaders = getDataloaders(graphqlLoaders);
  context.dataloaders = dataloaders;

  // load user
  if (context.user) {
    context.user = !(context.user instanceof User) ? new User(context.user, context, true) : context.user;
  }

  return {
    req: { headers: { origin } },
    koaContext: {
      request: {
        ip: '::ffff:127.0.0.1',
        header: {
          'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
          origin,
        },
      },
      cookies: { set: jest.fn() },
    },
    timezone: 'America/Sao_Paulo',
    t,
    origin,
    ...context,
  };
};
