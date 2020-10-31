import * as yup from 'yup';

import { GraphQLContext } from '../../../../types';

const UserRegistrationMutationSchema = (context: GraphQLContext): yup.ObjectSchema<yup.Shape<any, any>> => {
  const { t } = context;

  const schema = yup.object().shape({
    name: yup.string(),
    email: yup.string().email(t('auth', 'TheEmailMustBeAValidEmail')),
    password: yup.string().min(6, t('auth', 'PasswordMustBeAtLeast')),
  });

  return schema;
};

export default UserRegistrationMutationSchema;
