import mongoose, { Document, Model } from 'mongoose';

import { IStatusSchema, ObjectId } from '../../types';

import isActiveMongooseField from '../../mongoose/isActiveMongooseField';

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'The user who created this review.',
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    collection: 'Review',
    timestamps: true,
  },
);

export interface IReview extends Document, IStatusSchema {
  bookId: ObjectId;
  userId: ObjectId;
  rating: number;
  description?: string;
}

Schema.index({ createdAt: 1 });

const ReviewModel: Model<IReview> = mongoose.model('Review', Schema);

export default ReviewModel;
