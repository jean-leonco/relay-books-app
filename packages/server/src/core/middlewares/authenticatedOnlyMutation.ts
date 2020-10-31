import { GraphQLResolveInfo, GraphQLString } from 'graphql';

import { isLoggedIn } from '../security';

import { GraphQLContext } from '../../types';

import { getMutationFields } from './utils';

export default async function authenticatedOnlyMutation(
  root: any,
  args: { [argName: string]: any },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
  next: () => void,
) {
  const mutationFields = getMutationFields(info, info.fieldName);

  if (!mutationFields) {
    throw new Error('mutation without mutation fields');
  }

  const { authenticatedOnly } = mutationFields;

  if (authenticatedOnly) {
    if (!isLoggedIn(context)) {
      const fields = info.returnType.getFields();
      const message = context.t('auth', 'Unauthorized');

      if (fields.error && fields.error.type === GraphQLString) {
        context.koaContext.status = 401;

        return { error: message };
      }

      throw new Error(message);
    }

    return next();
  } else {
    return next();
  }
}
