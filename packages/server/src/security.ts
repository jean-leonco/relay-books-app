import User from './modules/user/UserLoader';

import { GraphQLContext, IStatusSchema } from './types';

export const isLoggedIn = (context: GraphQLContext) => {
  const { user } = context;

  if (user instanceof User) {
    return true;
  }

  return false;
};

export const isLoggedAndDataIsActiveViewerCanSee = <Value extends IStatusSchema>(
  context: GraphQLContext,
  data: Value,
) => {
  if (!context.user || !data.isActive) {
    return null;
  }

  return data;
};

export enum PLATFORM {
  APP = 'APP',
  UNKNOWN = 'UNKNOWN',
}

export const getPlatform = (platform?: string | null) => {
  if (typeof platform !== 'string') {
    return PLATFORM.UNKNOWN;
  }

  //if (platform.includes('ios') || platform.includes('android')) {
  //  return PLATFORM.APP;
  //}

  if (platform === PLATFORM.APP) {
    return PLATFORM.APP;
  }

  return PLATFORM.UNKNOWN;
};
