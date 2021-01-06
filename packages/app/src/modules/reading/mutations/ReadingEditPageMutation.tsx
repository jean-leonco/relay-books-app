import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, ROOT_ID } from 'relay-runtime';

import { connectionDeleteEdgeUpdater, connectionUpdater } from '@workspace/relay';

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

export const readingEditPageOptimisticResponse = (reading) => ({
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

export const readingEditPageUpdater = (input: ReadingEditPageInput, bookPages: number) => (
  store: RecordSourceSelectorProxy,
) => {
  if (input.currentPage === bookPages) {
    const edge = store.getRootField('ReadingEditPage').getLinkedRecord('readingEdge');

    connectionDeleteEdgeUpdater({
      parentId: ROOT_ID,
      connectionName: 'ContinueReading_unfinished',
      nodeId: input.id,
      store,
    });

    connectionUpdater({
      parentId: ROOT_ID,
      connectionName: 'ReadItAgain_finished',
      edge,
      before: true,
      store,
    });

    connectionUpdater({
      parentId: ROOT_ID,
      connectionName: 'Profile_readings',
      edge,
      store,
    });
  }
};
