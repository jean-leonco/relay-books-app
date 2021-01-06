import i18next from 'i18next';

import { GraphQLContext } from '../types';
import { PLATFORM } from '../security';

import { getDataloaders } from '../modules/loader/loaderRegister';

import User from '../modules/user/UserLoader';
import { IUser } from '../modules/user/UserModel';

import { t } from '../locales/helpers';
import en from '../locales/en';

i18next.init({
  lng: 'en',
  resources: { en: en },
  nsSeparator: '::',
});

interface GetContextProps {
  user?: IUser | null;
  ip?: string;
  appplatform?: PLATFORM;
}

export const getContext = async (props: GetContextProps = {}): Promise<GraphQLContext> => {
  const { user, ip } = props;

  const origin = 'http://127.0.0.1';

  const context: GraphQLContext = {
    req: {
      headers: {
        origin,
      },
    },
    koaContext: {
      request: {
        ip: ip || '::ffff:127.0.0.1',
        header: {
          'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
          origin,
        },
      },
    },
    t,
    origin,
  };

  context.dataloaders = getDataloaders();

  if (user) {
    context.user = user instanceof User ? context.user : new User(user, context);
  }

  return context;
};
