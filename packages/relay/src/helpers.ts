import { CacheConfig, RequestParameters, Variables } from 'relay-runtime';

export const isMutation = (request: RequestParameters) => request.operationKind === 'mutation';
export const isQuery = (request: RequestParameters) => request.operationKind === 'query';
export const forceFetch = (cacheConfig: CacheConfig) => !!(cacheConfig && cacheConfig.force);

export const handleData = (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  }

  return response.text();
};

export const getRequestBody = (request: RequestParameters, variables: Variables) => {
  return JSON.stringify({
    name: request.name,
    query: request.text, // GraphQL text from input
    variables,
  });
};
