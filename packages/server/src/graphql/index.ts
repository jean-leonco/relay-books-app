/* eslint-disable no-console */
import 'core-js/stable';
import { createServer } from 'http';

import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { GRAPHQL_PORT, GRAPHQL_HOST } from '../common/config';
import connectDatabase from '../common/database';

import app from './app';
import { schema } from './schema';

type ConnectionParams = {
  authorization?: string;
};

const runServer = async () => {
  try {
    console.log('\n🔗 Connecting to database...');
    await connectDatabase();
  } catch (error) {
    console.error('Could not connect to database', { error });
    throw error;
  }

  const server = createServer(app.callback());

  server.listen(GRAPHQL_PORT, () => {
    console.info(`\n🚀 Server started at http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`);

    if (process.env.NODE_ENV !== 'production') {
      console.info(`\n🎠 GraphQL Playground available at http://${GRAPHQL_HOST}:${GRAPHQL_PORT}/playground\n`);
    }

    SubscriptionServer.create(
      {
        onConnect: async (connectionParams: ConnectionParams) => {
          console.info('Client subscription connected', connectionParams);
          // @TODO - get user from connectionParams?.authorization
          // @TODO - return context with user
        },
        onDisconnect: () => console.info('Client subscription disconnected'),
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: '/subscriptions',
      },
    );
  });
};

(async () => {
  console.log('\n📡 Server starting...');
  await runServer();
})();
