import React from 'react';
import { ScrollView } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';
import { FormikHelpers, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';

import { Column, FormikButton, FormikInput, Space, Text } from '@workspace/ui';

import FormikRating from '../rating/FormikRating';

import { ReviewForm_book$key } from './__generated__/ReviewForm_book.graphql';

const containerCss = css`
  padding: 60px 24px 24px;
`;

const Banner = styled.Image`
  background: ${(p) => p.theme.colors.c2};
  width: 200px;
  height: 280px;
  border-radius: 8px;
`;

interface FormValues {
  rating: number;
  description: string;
}

interface ReviewFormProps {
  query: ReviewForm_book$key;
  initialValues: FormValues;
  onSubmit: (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => void | Promise<any>;
  submitLabel: string;
}

const ReviewForm = ({ query, initialValues, onSubmit, submitLabel }: ReviewFormProps) => {
  const data = useFragment(
    graphql`
      fragment ReviewForm_book on Book {
        id
        name
        author
        bannerUrl
      }
    `,
    query,
  );

  const formik = useFormik({
    initialValues,
    validationSchema: yup.object().shape({
      rating: yup.number().min(1, 'The rating should be at least one.').max(5, 'The rating should not be more than 5.'),
      description: yup.string().max(280, 'The description should not have more than 280 characters.'),
    }),
    onSubmit,
  });

  const { handleSubmit } = formik;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Column flex={1} css={containerCss}>
        <Column align="center" justify="center">
          <Banner source={{ uri: data.bannerUrl }} />
          <Space height={15} />
          <Space height={10} />
          <Text size="title" weight="bold" center>
            {data.name}
          </Text>
          <Space height={10} />
          <Text size="button" color="c3" center>
            {data.author}
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
          <FormikButton onPress={() => handleSubmit()}>{submitLabel}</FormikButton>
        </FormikProvider>
      </Column>
    </ScrollView>
  );
};

export default ReviewForm;
