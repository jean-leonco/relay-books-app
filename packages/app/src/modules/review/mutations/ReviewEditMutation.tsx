import { graphql } from 'react-relay';

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
