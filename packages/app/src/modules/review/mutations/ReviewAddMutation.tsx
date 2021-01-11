import { graphql } from 'react-relay';
import { ConnectionHandler, RecordSourceSelectorProxy, SelectorStoreUpdater } from 'relay-runtime';

import { connectionAddEdgeUpdater } from '@workspace/relay';

export const ReviewAdd = graphql`
  mutation ReviewAddMutation($input: ReviewAddInput!) {
    ReviewAdd(input: $input) {
      reviewEdge {
        node {
          id
          ...ReviewCard_review @arguments(hasUserName: true)
        }
      }
      error
    }
  }
`;

export const getReviewAddMutationUpdater = (bookId: string): SelectorStoreUpdater => (
  store: RecordSourceSelectorProxy,
) => {
  const edge = store.getRootField('ReviewAdd')?.getLinkedRecord('reviewEdge');

  if (!edge) {
    return;
  }

  const meProxy = store.getRoot().getLinkedRecord('me')!;

  const meReviewsProxy = meProxy?.getLinkedRecord('reviews(first:1)');
  if (meReviewsProxy) {
    const count = meReviewsProxy.getValue('count') as number;
    meReviewsProxy.setValue(count + 1, 'count');
  }

  const bookProxy = store.get(bookId);
  if (!bookProxy) {
    // eslint-disable-next-line no-console
    console.log(`book ${bookId} not found on store.`);
    return;
  }

  bookProxy.setValue(false, 'meCanReview');

  connectionAddEdgeUpdater({ store, rootID: bookId, connectionName: 'BookDetails_reviews', edge });

  const reviewConnection = meProxy ? ConnectionHandler.getConnection(meProxy, 'ReviewList_reviews') : null;

  if (reviewConnection) {
    connectionAddEdgeUpdater({ store, rootID: meProxy.getDataID(), connectionName: 'ReviewList_reviews', edge });
  }
};
