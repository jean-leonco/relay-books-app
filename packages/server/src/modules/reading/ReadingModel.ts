import mongoose, { Document, Model, Types } from 'mongoose';

import { isActiveMongooseField, removedAtMongooseField } from '../../core/mongoose/withMongooseFields';

const { ObjectId } = mongoose.Schema.Types;

const Schema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      description: 'The user that is reading.',
      required: true,
      index: true,
    },
    bookId: {
      type: ObjectId,
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
    ...removedAtMongooseField,
  },
  {
    collection: 'Reading',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export interface IReading extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  readPages: number;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingModel: Model<IReading> = mongoose.model('Reading', Schema);

export default ReadingModel;
