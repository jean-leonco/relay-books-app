import React from 'react';
import { useFragment, graphql } from 'react-relay/hooks';
import styled from 'styled-components/native';

import { Column, PercentageCompletedBar, Row, Space, Text } from '@booksapp/ui';

import { MainBookCard_book$key } from './__generated__/MainBookCard_book.graphql';

const Banner = styled.Image`
  background: ${(p) => p.theme.colors.c2};
  width: 160px;
  height: 240px;
  border-radius: 8px;
`;

interface MainBookCardProps {
  book: MainBookCard_book$key;
  percentageCompleted?: number;
  footer?: React.ReactNode;
}

const MainBookCard = ({ percentageCompleted, footer, ...props }: MainBookCardProps) => {
  const data = useFragment<MainBookCard_book$key>(
    graphql`
      fragment MainBookCard_book on Book {
        id
        bannerUrl
        name
        author
      }
    `,
    props.book,
  );

  return (
    <Row align="flex-end">
      <Column span={11}>
        <Banner source={{ uri: data?.bannerUrl }} />
      </Column>
      <Space width={13} />
      <Column span={8}>
        <Text size="button" weight="bold">
          {data?.name}
        </Text>
        <Space height={4} />
        <Text size="label" color="c3">
          {data?.author}
        </Text>
        {typeof percentageCompleted === 'number' && (
          <>
            <Space height={4} />
            <PercentageCompletedBar percentageCompleted={percentageCompleted} />
          </>
        )}
        {footer}
        <Space height={4} />
      </Column>
    </Row>
  );
};

export default MainBookCard;
