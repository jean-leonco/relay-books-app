import { GraphQLResolveInfo } from 'graphql';
import { ValidationError } from 'yup';

import { GraphQLContext } from '../../types';

import { getMutationFields } from './utils';

export default async function validationSchemaMutation(
  root: any,
  args: any,
  context: GraphQLContext,
  info: GraphQLResolveInfo,
  next: () => void,
) {
  try {
    const mutationFields = getMutationFields(info, info.fieldName);

    if (!mutationFields) {
      throw new Error('Your mutation do not have any field');
    }

    const { validationSchema } = mutationFields;

    if (!validationSchema) {
      return next();
    }

    if (!args) {
      throw new ValidationError(['Invalid mutation arguments'], 'Invalid mutation arguments', 'args');
    }

    const payload = args.input || args;
    const schema = validationSchema(context);
    await schema.validate(payload);

    return next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        error: error.message,
      };
    }
  }
}
