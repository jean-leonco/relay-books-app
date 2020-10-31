import { CacheConfig, UploadableMap, Variables } from 'react-relay';
import { RequestParameters, QueryResponseCache } from 'relay-runtime';

import fetchQuery from './fetchQuery';
import { forceFetch, isMutation, isQuery } from './helpers';

const oneMinute = 60 * 1000;
export const relayResponseCache = new QueryResponseCache({ size: 250, ttl: oneMinute });

const cacheHandler = async (
  request: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables: UploadableMap,
) => {
  const queryID = request.text;

  if (isMutation(request)) {
    relayResponseCache.clear();
    return fetchQuery(request, variables, uploadables);
  }

  const fromCache = relayResponseCache.get(queryID, variables);
  if (isQuery(request) && fromCache !== null && !forceFetch(cacheConfig)) {
    return fromCache;
  }

  const fromServer = await fetchQuery(request, variables, uploadables);
  if (fromServer) {
    relayResponseCache.set(queryID, variables, fromServer);
  }

  return fromServer;
};

export default cacheHandler;
