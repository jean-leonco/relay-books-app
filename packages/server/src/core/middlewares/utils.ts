import { GraphQLResolveInfo } from 'graphql';
import { ObjectSchema, Shape } from 'yup';

import { GraphQLContext } from '../../types';

interface GraphQLMutationConfig {
  validationSchema?(context: GraphQLContext): ObjectSchema<Shape<any, any>>;
  authenticatedOnly?: boolean;
}

export function getMutationFields(info: GraphQLResolveInfo, mutationName: string): GraphQLMutationConfig | null {
  const mutationType = info.schema.getMutationType();
  if (!mutationType) {
    return null;
  }

  const fields = mutationType.getFields();
  return fields[mutationName];
}
