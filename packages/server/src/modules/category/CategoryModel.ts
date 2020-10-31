import mongoose, { Document, Model } from 'mongoose';

import { isActiveMongooseField, removedAtMongooseField } from '../../core/mongoose/withMongooseFields';

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
    ...removedAtMongooseField,
  },
  {
    collection: 'Category',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export interface ICategory extends Document {
  name: string;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryModel: Model<ICategory> = mongoose.model('Category', Schema);

export default CategoryModel;
