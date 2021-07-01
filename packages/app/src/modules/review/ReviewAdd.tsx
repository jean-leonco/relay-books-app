import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

import useTranslation from '../../locales/useTranslation';
import useRouteWithParams from '../hooks/useRouteWithParams';

import { ReviewAddQuery } from './__generated__/ReviewAddQuery.graphql';
import { ReviewAddInput, ReviewAddMutation } from './mutations/__generated__/ReviewAddMutation.graphql';

import { ReviewAdd, getReviewAddMutationUpdater } from './mutations/ReviewAddMutation';

import ReviewForm from './ReviewForm';

const Review = () => {
  const { t } = useTranslation();

  const route = useRouteWithParams<{ bookId: string }>();
  const navigation = useNavigation();

  const [reviewAdd] = useMutation<ReviewAddMutation>(ReviewAdd);

  const data = useLazyLoadQuery<ReviewAddQuery>(
    graphql`
      query ReviewAddQuery($id: ID!) {
        book: node(id: $id) {
          id
          ...ReviewForm_book
        }
      }
    `,
    { id: route.params.bookId },
  );

  const initialValues = useMemo(
    () => ({
      rating: 3,
      description: '',
    }),
    [],
  );

  const handleSubmit = useCallback(
    ({ description, rating }, { setSubmitting }) => {
      const input: ReviewAddInput = { bookId: route.params.bookId, description, rating };

      reviewAdd({
        variables: { input },
        onCompleted: ({ ReviewAdd }) => {
          setSubmitting(false);

          if (!ReviewAdd || ReviewAdd.error) {
            ToastAndroid.show(ReviewAdd?.error || t('unable_to_create_review'), ToastAndroid.SHORT);
            return;
          }

          ToastAndroid.show(t('review_created_with_success'), ToastAndroid.SHORT);
          navigation.goBack();
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || t('unable_to_create_review'), ToastAndroid.SHORT);
        },
        updater: getReviewAddMutationUpdater(data.book!.id),
      });
    },
    [data.book, navigation, reviewAdd, route.params, t],
  );

  if (!data.book) {
    return null;
  }

  return (
    <ReviewForm query={data.book} initialValues={initialValues} onSubmit={handleSubmit} submitLabel={t('review')} />
  );
};

export default Review;
