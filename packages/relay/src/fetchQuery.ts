import { RequestParameters, UploadableMap, Variables } from 'relay-runtime';

import fetchWithRetries from './fetchWithRetries';
import { getRequestBody, handleData, isMutation } from './helpers';
import { GRAPHQL_URL, clientErrorStatus } from './config';
import { getLanguage, getToken } from './utils';
import UnavailableServiceError from './UnavailableServiceError';
import InvalidSessionError from './InvalidSessionError';

enum PLATFORM {
  APP = 'APP',
}

// Define a function that fetches the results of a request (query/mutation/etc)
// and returns its results as a Promise:
const fetchQuery = async (request: RequestParameters, variables: Variables, uploadables: UploadableMap | null) => {
  const body = getRequestBody(request, variables, uploadables);
  const token = await getToken();
  const lang = await getLanguage();

  const headers = {
    Accept: 'application/json',
    'Content-type': 'application/json',
    appplatform: PLATFORM.APP,
    authorization: token ? `JWT ${token}` : null,
    lang,
  };

  try {
    const isMutationOperation = isMutation(request);

    const fetchFn = isMutationOperation ? fetch : fetchWithRetries;

    const response = await fetchFn(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body,
      fetchTimeout: 20000,
      retryDelays: [1000, 3000, 5000],
    });

    const data = await handleData(response);

    if (clientErrorStatus.includes(response.status)) {
      throw data.errors;
    }

    if (isMutation(request) && data.errors) {
      throw data;
    }

    if (!data.data) {
      throw data.errors;
    }

    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('fetchQuery error:', err);

    const timeoutRegexp = new RegExp(/Still no successful response after/);
    const serverUnavailableRegexp = new RegExp(/Failed to fetch/);
    const invalidSessionRegexp = new RegExp(/invalid_session/);

    if (Array.isArray(err) && invalidSessionRegexp.test(err[0].key)) {
      throw new InvalidSessionError('Invalid session.');
    }

    if (timeoutRegexp.test(err.message) || serverUnavailableRegexp.test(err.message)) {
      throw new UnavailableServiceError('Unavailable service. Try again later.');
    }

    throw err;
  }
};

export default fetchQuery;
