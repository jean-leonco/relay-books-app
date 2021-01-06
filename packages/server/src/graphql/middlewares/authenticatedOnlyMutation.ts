import { GraphQLResolveInfo, GraphQLString } from 'graphql';

import { GraphQLContext } from '../../types';

import { getMutationFields } from './utils';

const authenticatedOnlyMutation = async (
  _root: any,
  _args: { [argName: string]: any },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
  next: () => void,
) => {
  const mutationFields = getMutationFields(info, info.fieldName);

  if (!mutationFields) {
    throw new Error('mutation without mutation fields');
  }

  if (!mutationFields.extensions) {
    return next();
  }

  const { authenticatedOnly } = mutationFields.extensions;

  if (!authenticatedOnly) {
    return next();
  }

  if (!context.user) {
    const fields = info.returnType.getFields();
    const message = context.t('auth', 'Unauthorized');

    if (fields.error && fields.error.type === GraphQLString) {
      context.koaContext.status = 401;

      return { error: message };
    }

    throw new Error(message);
  }

  return next();
};

export default authenticatedOnlyMutation;
