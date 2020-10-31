import * as yup from 'yup';

import { GraphQLContext } from '../../../../types';

const ReviewAddMutationSchema = (context: GraphQLContext): yup.ObjectSchema<yup.Shape<any, any>> => {
  const { t } = context;

  const schema = yup.object().shape({
    description: yup.string().max(280, t('common', 'TheDescriptionShouldNot', { size: '280' })),
  });

  return schema;
};

export default ReviewAddMutationSchema;
