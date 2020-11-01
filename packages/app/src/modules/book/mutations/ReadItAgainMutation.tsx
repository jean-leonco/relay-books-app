import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, ROOT_ID } from 'relay-runtime';

import { connectionDeleteEdgeUpdater, connectionUpdater } from '@booksapp/relay';

export const ReadItAgain = graphql`
  mutation ReadItAgainMutation($input: ReadingEditPageInput!) {
    ReadingEditPage(input: $input) {
      readingEdge {
        node {
          id
          ...ReadingCard_reading
        }
      }
      error
    }
  }
`;

export const readItAgainUpdater = (readingId: string) => (store: RecordSourceSelectorProxy) => {
  const edge = store.getRootField('ReadingEditPage').getLinkedRecord('readingEdge');

  connectionDeleteEdgeUpdater({
    parentId: ROOT_ID,
    connectionName: 'ReadItAgain_finished',
    nodeId: readingId,
    store,
  });

  connectionDeleteEdgeUpdater({
    parentId: ROOT_ID,
    connectionName: 'Profile_readings',
    nodeId: readingId,
    store,
  });

  connectionUpdater({
    store,
    parentId: ROOT_ID,
    connectionName: 'ContinueReading_unfinished',
    edge,
    before: true,
  });
};
