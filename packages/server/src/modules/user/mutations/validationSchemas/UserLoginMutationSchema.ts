import * as yup from 'yup';

import { GraphQLContext } from '../../../../types';

const UserLoginMutationSchema = (context: GraphQLContext) => {
  const { t } = context;

  const schema = yup.object().shape({
    email: yup.string().email(t('auth', 'TheEmailMustBeAValidEmail')),
    password: yup.string().min(6, t('auth', 'PasswordMustBeAtLeast')),
  });

  return schema;
};

export default UserLoginMutationSchema;
