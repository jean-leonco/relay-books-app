import { fromGlobalId } from 'graphql-relay';
import { Types } from 'mongoose';

import { Value } from '@booksapp/types';

const { ObjectId } = Types;

export const defaultFrozenKeys = ['id', 'createdAt', 'updatedAt', 'password'];

export const sanitizeValue = (
  value: Value,
  field: string | null,
  keys: string[],
  ignore: Array<string | never> = [],
  jsonKeys: Array<string | never> = [],
): Value => {
  // If value is empty, return `EMPTY` value so it's easier to debug
  // Check if value is boolean
  if (typeof value === 'boolean') {
    return value;
  }

  if (!value && value !== 0) {
    return 'EMPTY';
  }
  // If this current field is specified on the `keys` array, we simply redefine it
  // so it stays the same on the snapshot
  if (field && keys.indexOf(field) !== -1) {
    return `FROZEN-${field.toUpperCase()}`;
  }

  if (field && jsonKeys.indexOf(field) !== -1 && typeof value === 'string') {
    const jsonData = JSON.parse(value);

    return sanitizeTestObject(jsonData, keys, ignore, jsonKeys);
  }

  // if it's an array, sanitize the field
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, null, keys, ignore));
  }

  // Check if it's not an array and can be transformed into a string
  if (!Array.isArray(value) && typeof value.toString === 'function') {
    // Remove any non-alphanumeric character from value
    const cleanValue = value.toString().replace(/[^a-z0-9]/gi, '');

    // Check if it's a valid `ObjectId`, if so, replace it with a static value
    if (ObjectId.isValid(cleanValue) && value.toString().indexOf(cleanValue) !== -1) {
      if (cleanValue.length === 12) return cleanValue;
      return value.toString().replace(cleanValue, 'ObjectId');
    }

    if (value.constructor === Date) {
      // @TODO - should we always freeze Date ?
      return value;
      // return `FROZEN-${field.toUpperCase()}`;
    }

    // If it's an object, we call sanitizeTestObject function again to handle nested fields
    if (typeof value === 'object') {
      return sanitizeTestObject(value, keys, ignore, jsonKeys);
    }

    // Check if it's a valid globalId, if so, replace it with a static value
    const result = fromGlobalId(cleanValue);
    if (result.type && result.id && ObjectId.isValid(result.id)) {
      return 'GlobalID';
    }
  }

  // If it's an object, we call sanitizeTestObject function again to handle nested fields
  if (typeof value === 'object') {
    return sanitizeTestObject(value, keys, ignore, jsonKeys);
  }

  return value;
};

export const sanitizeTestObject = (
  payload: Value,
  keys = defaultFrozenKeys,
  ignore: string[] = [],
  jsonKeys: string[] = [],
) => {
  // @TODO - treat array as arrays
  return (
    payload &&
    Object.keys(payload).reduce((sanitizedObj, field) => {
      const value = payload[field];

      if (ignore.indexOf(field) !== -1) {
        return {
          ...sanitizedObj,
          [field]: value,
        };
      }

      const sanitizedValue = sanitizeValue(value, field, keys, ignore, jsonKeys);

      return {
        ...sanitizedObj,
        [field]: sanitizedValue,
      };
    }, {})
  );
};
