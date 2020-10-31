import React from 'react';
import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import Space from '../common/Space';
import Text from '../common/Text';

import { BookCard_book$key } from './__generated__/BookCard_book.graphql';

const Container = styled.View<{ index: number; css?: FlattenSimpleInterpolation }>`
  width: 120px;
  ${(p) => p.index === 0 && `margin-left: 12px;`}
  ${(p) => p.css}
`;

const Banner = styled.Image<{ css?: FlattenSimpleInterpolation }>`
  background: ${(p) => p.theme.colors.c2};
  width: 110px;
  height: 160px;
  border-radius: 8px;
  ${(p) => p.css}
`;

interface BookCardProps {
  book: BookCard_book$key;
  index: number;
  containerCss?: FlattenSimpleInterpolation;
  bannerCss?: FlattenSimpleInterpolation;
  showName?: boolean;
  route?: string;
}

const BookCard = ({ containerCss, bannerCss, showName = true, route = 'Book', ...props }: BookCardProps) => {
  const navigation = useNavigation();

  const data = useFragment<BookCard_book$key>(
    graphql`
      fragment BookCard_book on Book {
        id
        name
        bannerUrl
      }
    `,
    props.book,
  );

  return (
    <Container css={containerCss} {...props}>
      <TouchableOpacity onPress={() => navigation.navigate(route, { id: data.id })}>
        <Banner source={{ uri: data.bannerUrl }} css={bannerCss} />

        {
          <>
            <Space height={10} />
            {showName && (
              <Text size="text" color="c3" numberOfLines={2} style={{ paddingHorizontal: 6 }}>
                {data.name}
              </Text>
            )}
          </>
        }
      </TouchableOpacity>
    </Container>
  );
};

export default BookCard;
