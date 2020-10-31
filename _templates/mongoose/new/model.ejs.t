---
to: packages/<%=package%>/src/<%=dir%>/<%= h.inflection.camelize(name) %>Model.ts
---
import mongoose, { Document, Model } from 'mongoose';

import { isActiveMongooseField, removedAtMongooseField } from '../../core/mongoose/withMongooseFields';

const Schema = new mongoose.Schema(
  {
    ...isActiveMongooseField,
    ...removedAtMongooseField,
  },
  {
    collection: '<%=h.inflection.camelize(name)%>',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export interface I<%= h.inflection.camelize(name) %> extends Document {
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const <%= h.inflection.camelize(name) %>Model: Model<I<%= h.inflection.camelize(name) %>> = mongoose.model('<%= h.inflection.camelize(name) %>', Schema);

export default <%= h.inflection.camelize(name) %>Model;
