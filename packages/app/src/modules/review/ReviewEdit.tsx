import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';
import { useNavigation, useRoute } from '@react-navigation/native';

import useTranslation from '../../locales/useTranslation';

import ReviewForm from './ReviewForm';

import { ReviewEdit } from './mutations/ReviewEditMutation';
import { ReviewEditMutation } from './mutations/__generated__/ReviewEditMutation.graphql';
import { ReviewEditQuery } from './__generated__/ReviewEditQuery.graphql';

const Review = () => {
  const { t } = useTranslation();

  const route = useRoute();
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
      description: data.review.description,
      rating: data.review.rating,
    }),
    [data.review],
  );

  const handleSubmit = useCallback(
    ({ description, rating }, { setSubmitting }) => {
      reviewEdit({
        variables: { input: { id: route.params.id, description, rating } },
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
      });
    },
    [navigation, reviewEdit, route.params.id, t],
  );

  return (
    <ReviewForm
      query={data.review?.book}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel={t('edit_review')}
    />
  );
};

export default Review;