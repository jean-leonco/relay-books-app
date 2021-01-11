import React, { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay/hooks';
import { css, DefaultTheme, FlattenInterpolation, FlattenSimpleInterpolation, ThemeProps } from 'styled-components';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import Rating from '../rating/Rating';

import { ReviewCard_review$key } from './__generated__/ReviewCard_review.graphql';

const containerCss = css`
  margin: 10px 0;
`;

interface ReviewCardProps {
  query: ReviewCard_review$key;
  cardCss?: FlattenSimpleInterpolation | FlattenInterpolation<ThemeProps<DefaultTheme>>;
  onPress?(): void;
}

const ReviewCard = ({ query, cardCss, onPress, ...props }: ReviewCardProps) => {
  const { t } = useTranslation();

  const { book, user, ...data } = useFragment<ReviewCard_review$key>(
    graphql`
      fragment ReviewCard_review on Review
      @argumentDefinitions(
        hasUserName: { type: Boolean, defaultValue: false }
        hasBookName: { type: Boolean, defaultValue: false }
      ) {
        rating
        description
        user @include(if: $hasUserName) {
          fullName
        }
        book @include(if: $hasBookName) {
          name
        }
      }
    `,
    query,
  );

  const columnCss = useMemo(
    () =>
      css`
        ${containerCss};
        ${cardCss}
      `,
    [cardCss],
  );

  return (
    <Column css={columnCss} touchable={!!onPress} onPress={onPress} {...props}>
      <Row align="center">
        <Text size="label" color="c5">
          {book?.name ? book.name : user?.fullName}
        </Text>
        <Space width={20} />
        <Rating fixedValue={data.rating} size={14} disabled />
      </Row>
      <Space height={8} />
      <Text color="c3" italic={!data.description}>
        {data.description || t('no_description')}
      </Text>
    </Column>
  );
};

export default ReviewCard;
