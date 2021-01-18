import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, SelectorStoreUpdater } from 'relay-runtime';

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

export const getReadingRemoveMutationUpdater = (isFinished: boolean): SelectorStoreUpdater => (
  store: RecordSourceSelectorProxy,
) => {
  const deletedID = store.getRootField('ReadingRemove')?.getValue('deletedID') as string;

  if (!deletedID) {
    return;
  }

  if (isFinished) {
    const meReadingsProxy = store.getRoot().getLinkedRecord(`readings(filters:{\"finished\":true},first:1)`);
    if (meReadingsProxy) {
      const count = meReadingsProxy.getValue('count') as number;
      meReadingsProxy.setValue(count > 0 ? count - 1 : 0, 'count');
    }

    connectionDeleteEdgeUpdater({ store, connectionName: 'ReadItAgain_finished', nodeID: deletedID });
  } else {
    const meProxy = store.getRoot().getLinkedRecord('me')!;
    const lastReadingProxy = meProxy.getLinkedRecord('lastIncompleteReading');

    if (lastReadingProxy && lastReadingProxy.getDataID() === deletedID) {
      meProxy.setValue(null, 'lastIncompleteReading');
    }

    connectionDeleteEdgeUpdater({ store, connectionName: 'ContinueReading_unfinished', nodeID: deletedID });
  }

  connectionDeleteEdgeUpdater({ store, connectionName: 'LibrarySection_readings', nodeID: deletedID });
};
