import mongoose, { Document, Model } from 'mongoose';

import isActiveMongooseField from '../../mongoose/isActiveMongooseField';
import { IStatusSchema, ObjectId } from '../../types';

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'The user that is reading.',
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      description: 'The book being read.',
      required: true,
      index: true,
    },
    readPages: {
      type: Number,
      description: 'The total read pages. ex: 50',
      required: true,
    },
    ...isActiveMongooseField,
  },
  {
    collection: 'Reading',
    timestamps: true,
  },
);

export interface IReading extends Document, IStatusSchema {
  userId: ObjectId;
  bookId: ObjectId;
  readPages: number;
}

Schema.index({ createdAt: 1 });

const ReadingModel: Model<IReading> = mongoose.model('Reading', Schema);

export default ReadingModel;
