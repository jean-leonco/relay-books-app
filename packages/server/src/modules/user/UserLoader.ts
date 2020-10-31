import { mongooseLoader } from '@entria/graphql-mongoose-loader';
import DataLoader from 'dataloader';

import { Types } from 'mongoose';

import { DataLoaderKey, GraphQLContext, LoggedGraphQLContext } from '../../types';

import { isLoggedIn } from '../../core/security';

import UserModel, { IEmailSchema, IUser } from './UserModel';

export default class User {
  public registeredType = 'User';

  id: string;
  _id: Types.ObjectId;
  name: string;
  surname: string;
  email: IEmailSchema;
  lang?: string;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IUser, context: GraphQLContext) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isActive = data.isActive;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.lang = data.lang;
  }
}

const viewerCanSee = (context: GraphQLContext, data: IUser) => {
  if (!isLoggedIn(context)) {
    return false;
  }

  return true;
};

export const getLoader = () => new DataLoader<DataLoaderKey, IUser>((ids) => mongooseLoader(UserModel, ids));

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

    return viewerCanSee(context, data) ? new User(data, context) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: Types.ObjectId) =>
  dataloaders.UserLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: Types.ObjectId, data: IUser) =>
  dataloaders.UserLoader.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: Types.ObjectId, data: IUser) =>
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
