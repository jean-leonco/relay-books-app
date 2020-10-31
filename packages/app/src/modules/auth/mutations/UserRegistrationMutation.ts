import { graphql } from 'react-relay';

export const UserRegistration = graphql`
  mutation UserRegistrationMutation($input: UserRegistrationInput!) {
    UserRegistration(input: $input) {
      token
      error
    }
  }
`;
