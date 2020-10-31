import { graphql } from 'react-relay';

export const MeEdit = graphql`
  mutation MeEditMutation($input: MeEditInput!) {
    MeEdit(input: $input) {
      me {
        name
        email
        fullName
      }
      error
    }
  }
`;
