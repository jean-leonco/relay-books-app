import mongoose, { Document, Types, Model } from 'mongoose';

import { isActiveMongooseField, removedAtMongooseField } from '../../core/mongoose/withMongooseFields';

const { ObjectId } = mongoose.Schema.Types;

const Schema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      description: 'The user who created this review.',
      required: true,
      index: true,
    },
    bookId: {
      type: ObjectId,
      ref: 'Book',
      description: 'The book rated on this review.',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      description: 'The rating of the review. ex: 4.5',
      required: true,
    },
    description: {
      type: String,
      description: 'The review description. ex: This book is awesome',
    },
    ...isActiveMongooseField,
    ...removedAtMongooseField,
  },
  {
    collection: 'Review',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export interface IReview extends Document {
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  description?: string;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewModel: Model<IReview> = mongoose.model('Review', Schema);

export default ReviewModel;
