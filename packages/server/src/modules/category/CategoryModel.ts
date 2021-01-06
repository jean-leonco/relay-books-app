import mongoose, { Document, Model } from 'mongoose';

import { IStatusSchema } from '../../types';

import isActiveMongooseField from '../../mongoose/isActiveMongooseField';

const Schema = new mongoose.Schema(
  {
    // @TODO - add i18n keys and slug instead of just name
    name: {
      type: String,
      description: 'The category name. ex: Horror',
      required: true,
      index: true,
    },
    ...isActiveMongooseField,
  },
  {
    collection: 'Category',
    timestamps: true,
  },
);

export interface ICategory extends Document, IStatusSchema {
  name: string;
}

const CategoryModel: Model<ICategory> = mongoose.model('Category', Schema);

export default CategoryModel;
