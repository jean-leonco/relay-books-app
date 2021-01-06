import { GraphQLField, GraphQLResolveInfo } from 'graphql';

import { Extensions } from '../../types';

interface Field extends GraphQLField<any, any> {
  extensions: Extensions | null | undefined;
}

export function getMutationFields(info: GraphQLResolveInfo, mutationName: string): Field | null {
  const mutationType = info.schema.getMutationType();
  if (!mutationType) {
    return null;
  }

  const fields = mutationType.getFields();
  return fields[mutationName];
}
