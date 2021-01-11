import { graphql } from 'react-relay';
import { ConnectionHandler, RecordSourceSelectorProxy } from 'relay-runtime';

import { connectionAddEdgeUpdater } from '@workspace/relay';

export const ReadingAdd = graphql`
  mutation ReadingAddMutation($input: ReadingAddInput!) {
    ReadingAdd(input: $input) {
      readingEdge {
        node {
          id
          readPages
          book {
            id
            pages
            ...MainBookCard_book
          }
          ...ReadingCard_reading
        }
      }
      error
    }
  }
`;

export const getReadingAddUpdater = (store: RecordSourceSelectorProxy) => {
  const edge = store.getRootField('ReadingAdd')?.getLinkedRecord('readingEdge');

  if (!edge) {
    return;
  }

  const rootProxy = store.getRoot();
  const meProxy = rootProxy.getLinkedRecord('me')!;

  meProxy.setLinkedRecord(edge.getLinkedRecord('node'), 'lastIncompleteReading');

  const unfinishedConnectionProxy = ConnectionHandler.getConnection(rootProxy, 'ContinueReading_unfinished');

  if (unfinishedConnectionProxy) {
    connectionAddEdgeUpdater({ store, connectionName: 'ContinueReading_unfinished', edge });
  }

  connectionAddEdgeUpdater({ store, connectionName: 'ReadButton_readings', edge });
};
