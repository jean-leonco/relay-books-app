import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';
import { useNavigation, useRoute } from '@react-navigation/native';

import ReviewForm from './ReviewForm';

import { ReviewEdit } from './mutations/ReviewEditMutation';
import { ReviewEditMutation } from './mutations/__generated__/ReviewEditMutation.graphql';
import { ReviewEditQuery } from './__generated__/ReviewEditQuery.graphql';

const Review = () => {
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
            ToastAndroid.show(ReviewEdit?.error || 'Unable to edit review', ToastAndroid.SHORT);
            return;
          }

          ToastAndroid.show('Review edited with success', ToastAndroid.SHORT);
          navigation.goBack();
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || 'Unable to edit review', ToastAndroid.SHORT);
        },
      });
    },
    [navigation, reviewEdit, route.params.id],
  );

  return (
    <ReviewForm
      query={data.review?.book}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="Edit Review"
    />
  );
};

export default Review;
