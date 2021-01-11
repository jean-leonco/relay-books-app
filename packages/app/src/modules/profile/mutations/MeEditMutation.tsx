import { graphql } from 'react-relay';

import { MeEditInput } from './__generated__/MeEditMutation.graphql';

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

export const getMeEditOptimisticResponse = (input: MeEditInput & { id: string }) => ({
  MeEdit: {
    me: {
      id: input.id,
      name: input.name!.split(' ')[0],
      email: input.email,
      fullName: input.name,
    },
    error: null,
  },
});
