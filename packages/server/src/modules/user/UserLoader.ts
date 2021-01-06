import { mongooseLoader } from '@entria/graphql-mongoose-loader';
import DataLoader from 'dataloader';

import { DataLoaderKey, GraphQLContext, LoggedGraphQLContext, ObjectId } from '../../types';
import { isLoggedViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import UserModel, { IEmailSchema, IUser } from './UserModel';

export default class User {
  public registeredType = 'User';

  id: string;
  _id: ObjectId;
  name: string;
  surname: string;
  email: IEmailSchema;
  lang?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IUser, context: GraphQLContext) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.lang = data.lang;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isActive = data.isActive;
  }
}

export const getLoader = () => new DataLoader<DataLoaderKey, IUser>((ids) => mongooseLoader(UserModel, ids));

registerLoader('UserLoader', getLoader);

export const load = async (context: GraphQLContext, id: DataLoaderKey, isLogin?: boolean) => {
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

    return isLoggedViewerCanSee(context, data) ? new User(data, context) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: ObjectId) =>
  dataloaders.UserLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: ObjectId, data: IUser) =>
  dataloaders.UserLoader.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: ObjectId, data: IUser) =>
  clearCache(context, id) && primeCache(context, id, data);

export const findUserByEmail = async (context: GraphQLContext, email: string, raw = true): Promise<IUser | null> => {
  const result = raw
    ? await UserModel.findOne({ 'email.email': email }).lean<IUser>()
    : await UserModel.findOne({ 'email.email': email });

  return result;
};

export const userEmailExists = async (context: GraphQLContext, email: string): Promise<number | null> => {
  return await UserModel.countDocuments({ 'email.email': email });
};

export const meEmailExists = async (context: LoggedGraphQLContext, email: string): Promise<number | null> => {
  const { user } = context;
  return await UserModel.countDocuments({ 'email.email': email, _id: { $ne: user._id } });
};
