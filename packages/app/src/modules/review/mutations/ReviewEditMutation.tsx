import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy, SelectorStoreUpdater } from 'relay-runtime';

import { ReviewEditInput } from './__generated__/ReviewEditMutation.graphql';

export const ReviewEdit = graphql`
  mutation ReviewEditMutation($input: ReviewEditInput!) {
    ReviewEdit(input: $input) {
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

export const getReviewEditMutationOptimisticUpdater = (
  reviewId: string,
  input: ReviewEditInput,
): SelectorStoreUpdater => (store: RecordSourceSelectorProxy) => {
  const reviewProxy = store.get(reviewId);
  if (!reviewProxy) {
    // eslint-disable-next-line no-console
    console.log(`review ${reviewId} not found on store.`);
    return;
  }

  reviewProxy.setValue(input.rating, 'rating');
  reviewProxy.setValue(input.description, 'description');
};
