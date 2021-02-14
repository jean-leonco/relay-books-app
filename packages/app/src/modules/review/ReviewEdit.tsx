import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';

import useTranslation from '../../locales/useTranslation';
import useRouteWithParams from '../hooks/useRouteWithParams';

import { ReviewEditQuery } from './__generated__/ReviewEditQuery.graphql';
import { ReviewEditInput, ReviewEditMutation } from './mutations/__generated__/ReviewEditMutation.graphql';

import { ReviewEdit, getReviewEditMutationOptimisticUpdater } from './mutations/ReviewEditMutation';

import ReviewForm from './ReviewForm';

const Review = () => {
  const { t } = useTranslation();

  const route = useRouteWithParams<{ id: string }>();
  const navigation = useNavigation();

  const [reviewEdit] = useMutation<ReviewEditMutation>(ReviewEdit);

  const data = useLazyLoadQuery<ReviewEditQuery>(
    graphql`
      query ReviewEditQuery($id: ID!) {
        me {
          id
        }
        review: node(id: $id) {
          ... on Review {
            rating
            description
            book {
              ...ReviewForm_book
            }
          }
        }
      }
    `,
    { id: route.params.id },
  );

  const initialValues = useMemo(
    () => ({
      description: data.review?.description,
      rating: data.review?.rating,
    }),
    [data.review],
  );

  const handleSubmit = useCallback(
    ({ description, rating }, { setSubmitting }) => {
      const input: ReviewEditInput = { id: route.params.id, description, rating };

      reviewEdit({
        variables: { input },
        onCompleted: ({ ReviewEdit }) => {
          setSubmitting(false);

          if (!ReviewEdit || ReviewEdit.error) {
            ToastAndroid.show(ReviewEdit?.error || t('unable_to_edit_review'), ToastAndroid.SHORT);
            return;
          }

          ToastAndroid.show(t('review_edited_with_success'), ToastAndroid.SHORT);
          navigation.goBack();
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || t('unable_to_edit_review'), ToastAndroid.SHORT);
        },
        optimisticUpdater: getReviewEditMutationOptimisticUpdater(route.params.id, input),
      });
    },
    [navigation, reviewEdit, route.params.id, t],
  );

  if (!data.review || !data.review.book) {
    return null;
  }

  return (
    <ReviewForm
      query={data.review.book!}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel={t('edit_review')}
    />
  );
};

export default Review;
