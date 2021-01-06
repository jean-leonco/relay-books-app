import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, ROOT_ID, SelectorStoreUpdater } from 'relay-runtime';

import { connectionDeleteEdgeUpdater } from '@workspace/relay';

export const ReadingRemove = graphql`
  mutation ReadingRemoveMutation($input: ReadingRemoveInput!) {
    ReadingRemove(input: $input) {
      deletedID
      success
      error
    }
  }
`;

export const readingsRemoveMutationConnectionUpdater = (isFinished: boolean): SelectorStoreUpdater => (
  store: RecordSourceSelectorProxy,
) => {
  const deletedID = store.getRootField('ReadingRemove').getValue('deletedID');

  if (isFinished) {
    connectionDeleteEdgeUpdater({
      parentId: ROOT_ID,
      connectionName: 'Home_readings',
      nodeId: deletedID,
      store,
    });

    connectionDeleteEdgeUpdater({
      parentId: ROOT_ID,
      connectionName: 'ReadItAgain_finished',
      nodeId: deletedID,
      store,
    });

    connectionDeleteEdgeUpdater({
      parentId: ROOT_ID,
      connectionName: 'Profile_readings',
      nodeId: deletedID,
      store,
    });
  } else {
    connectionDeleteEdgeUpdater({
      parentId: ROOT_ID,
      connectionName: 'LastReadingSection_lastReading',
      nodeId: deletedID,
      store,
    });

    connectionDeleteEdgeUpdater({
      parentId: ROOT_ID,
      connectionName: 'ContinueReading_unfinished',
      nodeId: deletedID,
      store,
    });
  }

  connectionDeleteEdgeUpdater({
    parentId: ROOT_ID,
    connectionName: 'LibrarySection_readings',
    nodeId: deletedID,
    store,
  });
};
