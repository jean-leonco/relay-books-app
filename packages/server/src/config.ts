import path from 'path';

import dotEnvSafe from 'dotenv-safe';

const cwd = process.cwd();
const root = path.join.bind(cwd);

dotEnvSafe.config({
  allowEmptyValues: process.env.NODE_ENV !== 'production',
  path: root('.env'),
  sample: root('.env.example'),
});

// Environment
export const NODE_ENV = process.env.NODE_ENV;
export const isProduction = NODE_ENV === 'production';

// GraphQL
export const GRAPHQL_HOST = process.env.GRAPHQL_HOST || '127.0.0.1';
export const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 5001;

// Database
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/booksapp-dev';

// Security
export const JWT_KEY = process.env.JWT_KEY || 'key';
