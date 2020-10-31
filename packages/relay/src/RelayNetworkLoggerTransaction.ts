/* eslint-disable no-console */

// based on this: https://gist.github.com/AugustoCalaca/2259d7bf55c3561d45f3bcbf35839d47
// @TODO - improve based on this: https://github.com/facebook/relay/commit/de62d7e9f181a3591a4b0c310d0d332ab23172e0
import { OperationDescriptor, RequestParameters, Variables, GraphQLResponse } from '@types/relay-runtime';

export type LogEvent =
  | {
      name: 'queryresource.fetch';
      operation: OperationDescriptor;
      fetchPolicy: string;
      renderPolicy: string;
      hasFullQuery: boolean;
      shouldFetch: boolean;
    }
  | {
      name: 'execute.info';
      transactionID: number;
      info: any;
    }
  | {
      name: 'execute.start';
      transactionID: number;
      params: RequestParameters;
      variables: Variables;
    }
  | {
      name: 'execute.next';
      transactionID: number;
      response: GraphQLResponse;
    }
  | {
      name: 'execute.error';
      transactionID: number;
      error: Error;
    }
  | {
      name: 'execute.complete';
      transactionID: number;
    }
  | {
      name: 'execute.unsubscribe';
      transactionID: number;
    };

const unlogged: { [key: number]: LogEvent }[] = [];

export const RelayNetworkLoggerTransaction = (event: LogEvent) => {
  if (event.name === 'execute.start') {
    const { transactionID } = event;
    unlogged[transactionID] = [event];
    console.group('RelayNetworkLogger:', unlogged[transactionID]);
    console.groupEnd();
  }
  if (event.name === 'execute.next') {
    const { transactionID } = event;
    unlogged[transactionID] = [...unlogged[transactionID], event];
    console.group('RelayNetworkLogger:', unlogged[transactionID]);
    console.groupEnd();
  }
  if (event.name === 'execute.error' || event.name === 'execute.complete' || event.name === 'execute.unsubscribe') {
    const { transactionID } = event;
    console.group('RelayNetworkLogger:', unlogged[transactionID]);
    delete unlogged[transactionID];
    console.groupEnd();
  }
};
