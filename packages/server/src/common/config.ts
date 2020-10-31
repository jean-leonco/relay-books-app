import path from 'path';

import dotEnvSafe from 'dotenv-safe';
import envVar from 'env-var';

import { version } from '../../package.json';

export const PACKAGE_VERSION = version;

const cwd = process.cwd();

const root = path.join.bind(cwd);

dotEnvSafe.config({
  // allowEmptyValues: process.env.NODE_ENV !== 'production',
  allowEmptyValues: true,
  path: root('.env'),
  sample: root('.env.example'),
});

// expose BOOKSAPP_ENV
export const BOOKSAPP_ENV = envVar.get('BOOKSAPP_ENV').required().asString();

// expose COMMIT_SHA
export const COMMIT_SHA = envVar.get('COMMIT_SHA').required().asString();

// Export some settings that should always be defined
export const MONGO_URI = envVar.get('MONGO_URI').required().asString();

export const JWT_KEY = envVar.get('JWT_KEY').required().asString();

// Host
export const GRAPHQL_HOST = envVar.get('GRAPHQL_HOST').asString();

// Ports
export const GRAPHQL_PORT = envVar.get('GRAPHQL_PORT').default('5001').asPortNumber();

export const DEBUG_GRAPHQL = envVar.get('DEBUG_GRAPHQL').default('false').asBoolStrict();
