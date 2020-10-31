import React from 'react';
import { ScrollView, ToastAndroid } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Column, FormikButton, FormikInput, Space, Text } from '@booksapp/ui';
import { useMutation } from '@booksapp/relay';

import FormikRating from '../rating/FormikRating';

import { ReviewAdd, reviewAddMutationConnectionUpdater } from './mutations/ReviewAddMutation';
import { ReviewAddMutation } from './mutations/__generated__/ReviewAddMutation.graphql';
import { ReviewQuery } from './__generated__/ReviewQuery.graphql';

const containerCss = css`
  padding: 60px 24px 24px;
`;

const Banner = styled.Image`
  background: ${(p) => p.theme.colors.c2};
  width: 200px;
  height: 280px;
  border-radius: 8px;
`;

const Review = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [reviewAdd] = useMutation<ReviewAddMutation>(ReviewAdd);

  const data = useLazyLoadQuery<ReviewQuery>(
    graphql`
      query ReviewQuery($id: ID!) {
        me {
          id
        }
        book: node(id: $id) {
          ... on Book {
            id
            name
            author
            bannerUrl
          }
        }
      }
    `,
    { id: route.params.bookId },
  );

  const formik = useFormik({
    initialValues: {
      rating: 3,
      description: '',
    },
    validationSchema: yup.object().shape({
      rating: yup.number().min(1, 'The rating should be at least one.').max(5, 'The rating should not be more than 5.'),
      description: yup.string().max(280, 'The description should not have more than 280 characters.'),
    }),
    onSubmit: ({ description, rating }, { setSubmitting }) => {
      reviewAdd({
        variables: { input: { bookId: route.params.bookId, description, rating } },
        onCompleted: ({ ReviewAdd }) => {
          setSubmitting(false);

          if (!ReviewAdd || ReviewAdd.error) {
            ToastAndroid.show(ReviewAdd?.error || 'Unable to create review', ToastAndroid.SHORT);
            return;
          }

          ToastAndroid.show('Review created with success', ToastAndroid.SHORT);
          navigation.goBack();
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || 'Unable to create review', ToastAndroid.SHORT);
        },
        updater: reviewAddMutationConnectionUpdater(data.book.id, data.me.id),
      });
    },
  });

  const { handleSubmit } = formik;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Column flex={1} css={containerCss}>
        <Column align="center" justify="center">
          <Banner source={{ uri: data.book?.bannerUrl }} />
          <Space height={15} />
          <Space height={10} />
          <Text size="title" weight="bold" center>
            {data.book?.name}
          </Text>
          <Space height={10} />
          <Text size="button" color="c3" center>
            {data.book?.author}
          </Text>
        </Column>
        <Space height={30} />

        <FormikProvider value={formik}>
          <FormikInput
            name="description"
            label="Description"
            placeholder="How would you describe your experience?"
            multiline
            style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
          />
          <FormikRating label="Rating" name="rating" size={25} />
          <Space height={40} />
          <FormikButton onPress={() => handleSubmit()}>Review</FormikButton>
        </FormikProvider>
      </Column>
    </ScrollView>
  );
};

export default Review;
