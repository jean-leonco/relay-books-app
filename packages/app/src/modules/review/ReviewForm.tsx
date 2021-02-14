import { FormikHelpers, FormikProvider, useFormik } from 'formik';
import React from 'react';
import { ScrollView } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';
import * as yup from 'yup';

import { Column, FormikButton, FormikInput, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

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
  rating: number | null | undefined;
  description: string | null | undefined;
}

interface ReviewFormProps {
  query: ReviewForm_book$key;
  initialValues: FormValues;
  onSubmit: (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => void | Promise<any>;
  submitLabel: string;
}

const ReviewForm = ({ query, initialValues, onSubmit, submitLabel }: ReviewFormProps) => {
  const { t } = useTranslation();

  const data = useFragment(
    graphql`
      fragment ReviewForm_book on Book {
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
      rating: yup.number().min(1, t('the_rating_should_be_at_least_')).max(5, t('the_rating_should_not_be_more_than_')),
      description: yup.string().max(280, t('the_description_should_not_have_more_than_')),
    }),
    onSubmit,
  });

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Column flex={1} css={containerCss}>
        <Column align="center" justify="center">
          <Banner source={{ uri: data.bannerUrl! }} />
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
            label={t('description')}
            placeholder={t('how_would_you_describe_your_experience')}
            multiline
            style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
          />
          <FormikRating label={t('rating')} name="rating" size={25} />
          <Space height={40} />
          <FormikButton>{submitLabel}</FormikButton>
        </FormikProvider>
      </Column>
    </ScrollView>
  );
};

export default ReviewForm;
