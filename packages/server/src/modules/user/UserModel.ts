import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Query } from 'mongoose';

import { isActiveMongooseField, removedAtMongooseField } from '../../core/mongoose/withMongooseFields';

const EmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      description: 'User email to be used on login',
      trim: true,
      index: true,
    },
    wasVerified: {
      type: Boolean,
      description: 'Whether or not this email was verified',
    },
  },
  {
    _id: false,
  },
);

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      description: 'User name',
      trim: true,
    },
    surname: {
      type: String,
      description: 'User surname',
      trim: true,
    },
    password: {
      type: String,
      hidden: true,
    },
    email: {
      type: EmailSchema,
      description: 'E-mail of this user',
    },
    lang: {
      type: String,
      description: 'Language of the user',
    },
    ...isActiveMongooseField,
    ...removedAtMongooseField,
  },
  {
    collection: 'User',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export interface UserModel extends Model<IUser> {
  encryptPassword(password: string): Promise<string>;
}

Schema.methods = {
  async authenticate(plainText: string) {
    try {
      return await bcrypt.compare(plainText, this.password);
    } catch (err) {
      return false;
    }
  },
};

Schema.statics = {
  encryptPassword(password: string) {
    return bcrypt.hash(password, 8);
  },
};

Schema.pre<IUser>('save', async function preSave() {
  if (this.isModified('password') && this.password) {
    this.password = await UserModel.encryptPassword(this.password);
  }
});

async function preUpdate(this: Query<IUser>) {
  const update = this.getUpdate();
  if (update && update.password) {
    update.password = await UserModel.encryptPassword(update.password);
  }
  if (update.$set && update.$set.password) {
    update.$set.password = await UserModel.encryptPassword(update.$set.password);
  }
}

Schema.pre('update', preUpdate);
Schema.pre('updateMany', preUpdate);
Schema.pre('updateOne', preUpdate);
Schema.pre('findOneAndUpdate', preUpdate);

Schema.pre<UserModel>('insertMany', async function preInsertMany(_next, docs) {
  for await (const doc of docs) {
    if (!doc.password) {
      continue;
    }
    const hash = await this.encryptPassword(doc.password);
    doc.password = hash;
  }
});

export interface IEmailSchema {
  email: string;
  wasVerified: boolean;
}

export interface IUser extends Document {
  name: string;
  surname: string;
  password?: string;
  email: IEmailSchema;
  lang?: string;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authenticate: (plainTextPassword: string) => boolean;
}

const UserModel: UserModel = mongoose.model<IUser, UserModel>('User', Schema);

export default UserModel;
