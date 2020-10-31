import mongoose, { Document, Model, Types } from 'mongoose';

import { PLATFORM } from '../../common/utils';
import { isActiveMongooseField } from '../../core/mongoose/withMongooseFields';

const { ObjectId } = mongoose.Schema.Types;

export enum SESSION_TOKEN_SCOPES {
  RESET_PASSWORD = 'BOOKSAPP:RESET_PASSWORD', // used when user requested a password reset
  SESSION = 'BOOKSAPP:SESSION', // token for a valid user session
}

const Schema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      description: 'User owner of this token.',
    },
    ip: {
      type: String,
      description: 'Agent IP that came from request headers.',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      default: PLATFORM.APP,
      description: 'Channel that this token belongs too. ex: APP',
      enum: Object.values(PLATFORM),
    },
    name: {
      type: String,
      description: 'Name of this token. ex: Jean Linux',
    },
    scope: {
      type: String,
      description: 'Scope of this session token. ex: SESSION',
    },
    expiresIn: {
      type: Date,
      description: 'When this session token expires.',
    },
    isBlocked: {
      type: Boolean,
      description: 'If the token is blocked.',
      default: false,
      required: true,
      index: true,
    },
    ...isActiveMongooseField,
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    collection: 'SessionToken',
  },
);

export interface ISessionToken extends Document {
  user: Types.ObjectId;
  ip: string;
  channel: string;
  isActive: boolean;
  isBlocked: boolean;
  name: string;
  scope: string;
  expiresIn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SessionTokenModel: Model<ISessionToken> = mongoose.model('SessionToken', Schema);

export default SessionTokenModel;
