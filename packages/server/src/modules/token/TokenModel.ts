import mongoose, { Document, Model } from 'mongoose';

import { IStatusSchema, ObjectId } from '../../types';

import { PLATFORM } from '../../security';
import isActiveMongooseField from '../../mongoose/isActiveMongooseField';

export enum TOKEN_SCOPES {
  RESET_PASSWORD = 'BOOKSAPP:RESET_PASSWORD', // used when user requested a password reset
  SESSION = 'BOOKSAPP:SESSION', // token for a valid user session
}

const Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'The user owner of this token.',
      index: true,
      default: null,
    },
    ip: {
      type: String,
      description: 'Agent IP that came from request headers.',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      default: PLATFORM.APP,
      description: 'Channel that this token belongs to. ex: APP.',
      enum: Object.values(PLATFORM),
    },
    scope: {
      type: String,
      description: 'Scope of this token. ex: SESSION.',
      required: true,
      index: true,
      enum: Object.values(TOKEN_SCOPES),
    },
    expiresIn: {
      type: Date,
      description: 'When this token expires.',
      default: null,
    },
    isBlocked: {
      type: Boolean,
      description: 'If the token is blocked.',
      default: false,
      index: true,
    },
    ...isActiveMongooseField,
  },
  {
    timestamps: true,
    collection: 'Token',
  },
);

export interface IToken extends Document, IStatusSchema {
  userId?: ObjectId;
  ip: string;
  platform: PLATFORM;
  scope: TOKEN_SCOPES;
  expiresIn: Date | null;
  isBlocked: boolean;
}

const TokenModel: Model<IToken> = mongoose.model('Token', Schema);

export default TokenModel;
