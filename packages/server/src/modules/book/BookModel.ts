import mongoose, { Document, Model } from 'mongoose';

import { IStatusSchema, ObjectId } from '../../types';

import isActiveMongooseField from '../../mongoose/isActiveMongooseField';

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      description: 'The book name. ex: O Alienista',
      required: true,
      index: true,
    },
    author: {
      type: String,
      description: 'The book author. ex: Machado de Assis',
      required: true,
      index: true,
    },
    description: {
      type: String,
      description: 'The book description.',
      required: true,
      index: true,
    },
    releaseYear: {
      type: Number,
      description: 'The book release year. ex: 1882',
      //required: true,
    },
    pages: {
      type: Number,
      description: 'The book total page. ex: 96',
      required: true,
    },
    bannerUrl: {
      type: String,
      description: 'The book banner url.',
      required: true,
    },
    ISBN: {
      type: Number,
      description: 'The book banner ISBN. ex: 9780850515060',
      //required: true,
    },
    language: {
      type: String,
      description: 'The book language. ex: Portuguese',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      description: 'The book category _id.',
      //required: true,
      index: true,
    },
    ...isActiveMongooseField,
  },
  {
    collection: 'Book',
    timestamps: true,
  },
);

export interface IBook extends Document, IStatusSchema {
  name: string;
  author: string;
  description: string;
  releaseYear: number;
  pages: number;
  bannerUrl: string;
  ISBN?: number;
  language?: string;
  categoryId: ObjectId;
}

Schema.index({ createdAt: 1 });

const BookModel: Model<IBook> = mongoose.model('Book', Schema);

export default BookModel;
