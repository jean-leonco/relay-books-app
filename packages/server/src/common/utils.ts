import { Model, Types } from 'mongoose';
import { fromGlobalId } from 'graphql-relay';

// https://stackoverflow.com/a/2593661/710693
export const escapeRegex = (str: string) => `${str}`.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');

export const PLATFORM = {
  APP: 'APP',
  UNKNOWN: 'UNKNOWN',
};

export const getPlatform = (platform?: string | null): string => {
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

export function kilometersToEarthRadians(kilometers: number) {
  return kilometers / 6378.1;
}

// returns an ObjectId given an param of unknown type
export const getObjectId = (target: string | Model<any> | Types.ObjectId | undefined | null): Types.ObjectId | null => {
  if (!target) {
    return null;
  }

  if (target instanceof Types.ObjectId) {
    return new Types.ObjectId(target.toString());
  }

  if (typeof target === 'object') {
    return target && target._id ? new Types.ObjectId(target._id) : null;
  }

  if (typeof target === 'string') {
    const result = fromGlobalId(target);

    if (result.type && result.id && Types.ObjectId.isValid(result.id)) {
      return new Types.ObjectId(result.id);
    }

    if (Types.ObjectId.isValid(target)) {
      return new Types.ObjectId(target);
    }

    return null;
  }

  return null;
};

type EnumObject = {
  [key: string]: string;
};

type EnumObjectResult = {
  [key: string]: {
    value: string;
  };
};

export const enumBuilderValues = (constants: EnumObject): EnumObjectResult =>
  Object.keys(constants).reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: {
        value: constants[curr],
      },
    }),
    {},
  );
