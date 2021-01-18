import { graphql } from 'react-relay';
import { ConnectionHandler, RecordSourceSelectorProxy } from 'relay-runtime';

import { connectionDeleteEdgeUpdater, connectionAddEdgeUpdater } from '@workspace/relay';

import { ReadingEditPageInput } from './__generated__/ReadingEditPageMutation.graphql';

export const ReadingEditPage = graphql`
  mutation ReadingEditPageMutation($input: ReadingEditPageInput!) {
    ReadingEditPage(input: $input) {
      readingEdge {
        node {
          id
          readPages
        }
      }
      error
    }
  }
`;

export const getReadingEditPageOptimisticResponse = (reading) => ({
  ReadingEditPage: {
    error: null,
    readingEdge: {
      node: {
        id: reading.id,
        readPages: reading.currentPage,
      },
    },
  },
});

interface GetReadingEditPageUpdaterProps {
  input: ReadingEditPageInput;
  bookPages: number;
  bookId: string;
  meId: string;
}

export const getReadingEditPageUpdater = ({ input, bookPages, bookId }: GetReadingEditPageUpdaterProps) => (
  store: RecordSourceSelectorProxy,
) => {
  const edge = store.getRootField('ReadingEditPage')!.getLinkedRecord('readingEdge');

  if (input.currentPage === bookPages) {
    const meReadingsProxy = store.getRoot().getLinkedRecord(`readings(filters:{\"finished\":true},first:1)`);
    if (meReadingsProxy) {
      const count = meReadingsProxy.getValue('count') as number;
      meReadingsProxy.setValue(count + 1, 'count');
    }

    const meProxy = store.getRoot().getLinkedRecord('me');
    const lastReadingProxy = meProxy!.getLinkedRecord('lastIncompleteReading');

    if (lastReadingProxy) {
      const lastReadingBookId = lastReadingProxy.getLinkedRecord('book')!.getDataID();

      if (lastReadingBookId === bookId) {
        meProxy!.setValue(null, 'lastIncompleteReading');
      }
    }

    connectionDeleteEdgeUpdater({ store, connectionName: 'ContinueReading_unfinished', nodeID: input.id });
    connectionAddEdgeUpdater({ store, connectionName: 'ReadItAgain_finished', edge });
  } else {
    const rootProxy = store.getRoot();
    const finishedConnectionProxy = ConnectionHandler.getConnection(rootProxy, 'ReadItAgain_finished');

    if (finishedConnectionProxy) {
      const finishedConnectionEdgesProxy = finishedConnectionProxy.getLinkedRecords('edges')!;

      for (let i = 0; i < finishedConnectionEdgesProxy.length; i++) {
        const finishedConnectionEdgeProxy = finishedConnectionEdgesProxy[i].getLinkedRecord('node')!;
        const finishedConnectionEdgeBookProxy = finishedConnectionEdgeProxy.getLinkedRecord('book')!;

        if (finishedConnectionEdgeBookProxy.getDataID() === bookId) {
          connectionDeleteEdgeUpdater({ store, connectionName: 'ReadItAgain_finished', nodeID: input.id });
          connectionAddEdgeUpdater({ store, connectionName: 'ContinueReading_unfinished', edge });
          break;
        }
      }
    }
  }
};
