import { GraphQLString, GraphQLObjectType } from 'graphql';

import { PACKAGE_VERSION, COMMIT_SHA, BOOKSAPP_ENV } from '../../common/config';

export interface Status {
  env: string;
  version: string;
  commitSha: string;
}

const StatusType = new GraphQLObjectType<Status>({
  name: 'Status',
  description: 'Status',
  fields: () => ({
    env: {
      type: GraphQLString,
      description: 'Books app environment',
      resolve: () => BOOKSAPP_ENV,
    },
    version: {
      type: GraphQLString,
      description: 'Server build version',
      resolve: () => PACKAGE_VERSION,
    },
    commitSha: {
      type: GraphQLString,
      description: 'Server commit sha, GITHUB_SHA',
      resolve: () => COMMIT_SHA,
    },
    e: {
      type: GraphQLString,
      description: 'Books app environment',
      resolve: () => BOOKSAPP_ENV,
    },
    v: {
      type: GraphQLString,
      description: 'Server build version',
      resolve: () => PACKAGE_VERSION,
    },
    c: {
      type: GraphQLString,
      description: 'Server commit sha, GITHUB_SHA',
      resolve: () => COMMIT_SHA,
    },
  }),
});

export default StatusType;
