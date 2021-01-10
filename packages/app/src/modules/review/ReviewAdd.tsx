import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';
import { useNavigation, useRoute } from '@react-navigation/native';

import useTranslation from '../../locales/useTranslation';

import ReviewForm from './ReviewForm';

import { ReviewAdd, reviewAddMutationConnectionUpdater } from './mutations/ReviewAddMutation';
import { ReviewAddMutation } from './mutations/__generated__/ReviewAddMutation.graphql';
import { ReviewAddQuery } from './__generated__/ReviewAddQuery.graphql';

const Review = () => {
  const { t } = useTranslation();

  const route = useRoute();
  const navigation = useNavigation();

  const [reviewAdd] = useMutation<ReviewAddMutation>(ReviewAdd);

  const data = useLazyLoadQuery<ReviewAddQuery>(
    graphql`
      query ReviewAddQuery($id: ID!) {
        me {
          id
        }
        book: node(id: $id) {
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
      reviewAdd({
        variables: { input: { bookId: route.params.bookId, description, rating } },
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
        updater: reviewAddMutationConnectionUpdater(data.book.id, data.me.id),
      });
    },
    [data.book, data.me, navigation, reviewAdd, route.params.bookId, t],
  );

  return (
    <ReviewForm query={data.book} initialValues={initialValues} onSubmit={handleSubmit} submitLabel={t('review')} />
  );
};

export default Review;
