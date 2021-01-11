import { createLoader, DataLoaderKey, getObjectId } from '@entria/graphql-mongo-helpers';

import { GraphQLContext, LoggedGraphQLContext } from '../../types';
import { isLoggedAndDataIsActiveViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import UserModel, { IUser } from './UserModel';

const { Wrapper: User, clearCache, getLoader } = createLoader({
  model: UserModel,
  loaderName: 'UserLoader',
});

const load = async (context: GraphQLContext, id: DataLoaderKey, isLogin?: boolean) => {
  if (!id) {
    return null;
  }

  try {
    const data = await context.dataloaders.UserLoader.load(id);

    if (!data) {
      return null;
    }

    if (isLogin) {
      return new User(data, context);
    }

    return isLoggedAndDataIsActiveViewerCanSee(context, data) ? new User(data, context) : null;
  } catch (err) {
    return null;
  }
};

registerLoader('UserLoader', getLoader);

export const findUserByEmail = async (_context: GraphQLContext, email: string, raw = true): Promise<IUser | null> => {
  const result = raw
    ? await UserModel.findOne({ 'email.email': email, isActive: true }).lean<IUser>()
    : await UserModel.findOne({ 'email.email': email, isActive: true });

  return result;
};

export const userEmailExists = async (_context: GraphQLContext, email: string): Promise<number | null> => {
  return UserModel.countDocuments({ 'email.email': email });
};

export const meEmailExists = async (context: LoggedGraphQLContext, email: string): Promise<number | null> => {
  return UserModel.countDocuments({
    _id: {
      $ne: getObjectId(context.user.id),
    },
    'email.email': email,
    isActive: true,
  });
};

export { getLoader, clearCache, load };

export default User;
