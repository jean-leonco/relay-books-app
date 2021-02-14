import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';

import { connectionAddEdgeUpdater, connectionDeleteEdgeUpdater } from '@workspace/relay';

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

export const getReadItAgainUpdater = (nodeID: string) => (store: RecordSourceSelectorProxy) => {
  const edge = store.getRootField('ReadingEditPage')?.getLinkedRecord('readingEdge');

  if (!edge) {
    return;
  }

  const meReadingsProxy = store.getRoot().getLinkedRecord(`readings(filters:{\"finished\":true},first:1)`);
  if (meReadingsProxy) {
    const count = meReadingsProxy.getValue('count') as number;
    meReadingsProxy.setValue(count > 0 ? count - 1 : 0, 'count');
  }

  connectionDeleteEdgeUpdater({ store, connectionName: 'ReadItAgain_finished', nodeID });
  connectionAddEdgeUpdater({ store, connectionName: 'ContinueReading_unfinished', edge });
};
