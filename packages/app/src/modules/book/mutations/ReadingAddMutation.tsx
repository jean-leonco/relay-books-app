import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, ROOT_ID } from 'relay-runtime';

import { connectionUpdater } from '@booksapp/relay';

export const ReadingAdd = graphql`
  mutation ReadingAddMutation($input: ReadingAddInput!) {
    ReadingAdd(input: $input) {
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

export const readingAddUpdater = (store: RecordSourceSelectorProxy) => {
  const edge = store.getRootField('ReadingAdd').getLinkedRecord('readingEdge');

  connectionUpdater({
    store,
    parentId: ROOT_ID,
    connectionName: 'ContinueReading_unfinished',
    edge,
    before: true,
  });

  connectionUpdater({
    store,
    parentId: ROOT_ID,
    connectionName: 'ReadButton_readings',
    edge,
    before: true,
  });
};
