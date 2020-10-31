import * as yup from 'yup';

import { GraphQLContext } from '../../../../types';

const UserForgotPasswordSchema = (context: GraphQLContext): yup.ObjectSchema<yup.Shape<object, any>> => {
  const { t } = context;

  const schema = yup.object().shape({
    email: yup.string().email(t('user', 'TheEmailIsInvalid')),
  });

  return schema;
};

export default UserForgotPasswordSchema;
