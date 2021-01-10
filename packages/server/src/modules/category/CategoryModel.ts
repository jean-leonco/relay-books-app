import mongoose, { Document, Model } from 'mongoose';

import { IStatusSchema } from '../../types';

import isActiveMongooseField from '../../mongoose/isActiveMongooseField';

const Schema = new mongoose.Schema(
  {
    key: {
      type: String,
      description: 'The category key. ex: horror',
      required: true,
      index: true,
    },
    translation: {
      type: Map,
      of: String,
      description: 'The category translation. ex: { en: Horror }',
    },
    ...isActiveMongooseField,
  },
  {
    collection: 'Category',
    timestamps: true,
  },
);

export interface ICategory extends Document, IStatusSchema {
  key: string;
  translation: Record<string, string>;
}

const CategoryModel: Model<ICategory> = mongoose.model('Category', Schema);

export default CategoryModel;
