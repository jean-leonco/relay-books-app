import { SubscribeFunction, Observable } from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import { GRAPHQL_URL } from './config';
import { getToken } from './security';

const websocketURL = `ws://${GRAPHQL_URL}/subscriptions` || 'ws://localhost:5001/subscriptions';

export const setupSubscription: SubscribeFunction = async (request, variables) => {
  const query = request.text;

  const authorization = await getToken();

  const connectionParams = {};

  if (authorization) {
    connectionParams['authorization'] = authorization;
  }

  const subscriptionClient = new SubscriptionClient(websocketURL, {
    reconnect: true,
    connectionParams,
  });

  const observable = subscriptionClient.request({ query: query!, variables });

  return Observable.from(observable);
};
