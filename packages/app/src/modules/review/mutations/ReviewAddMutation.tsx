import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, SelectorStoreUpdater } from 'relay-runtime';

import { connectionUpdater } from '@booksapp/relay';

export const ReviewAdd = graphql`
  mutation ReviewAddMutation($input: ReviewAddInput!) {
    ReviewAdd(input: $input) {
      reviewEdge {
        node {
          id
          ...ReviewCard_review
        }
      }
      error
    }
  }
`;

export const reviewAddMutationConnectionUpdater = (bookId: string, meId: string): SelectorStoreUpdater => (
  store: RecordSourceSelectorProxy,
) => {
  const newEdge = store.getRootField('ReviewAdd').getLinkedRecord('reviewEdge');

  connectionUpdater({
    store,
    parentId: bookId,
    connectionName: 'BookDetails_reviews',
    edge: newEdge,
    before: true,
  });

  connectionUpdater({
    store,
    parentId: meId,
    connectionName: 'Profile_reviews',
    edge: newEdge,
    before: true,
  });
};
