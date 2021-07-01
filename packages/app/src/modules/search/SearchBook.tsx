import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { css } from 'styled-components';
import styled from 'styled-components/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import Rating from '../rating/Rating';

import { SearchBook_book$key } from './__generated__/SearchBook_book.graphql';

const containerCss = css`
  margin: 10px 0;
`;

const Banner = styled.Image`
  background: ${(p) => p.theme.colors.c2};
  width: 90px;
  height: 110px;
  border-radius: 8px;
`;

interface SearchBookProps {
  book: SearchBook_book$key;
}

const SearchBook = (props: SearchBookProps) => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const data = useFragment<SearchBook_book$key>(
    graphql`
      fragment SearchBook_book on Book {
        id
        name
        author
        bannerUrl
        rating
        reviews {
          count
        }
      }
    `,
    props.book,
  );

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Book', { id: data.id })}>
      <Row align="center" css={containerCss}>
        <Banner source={{ uri: data.bannerUrl! }} />
        <Space width={12} />
        <Column>
          <Text size="button" weight="bold">
            {data.name}
          </Text>
          <Space height={4} />
          <Text size="label" color="c3">
            {data.author}
          </Text>
          <Space height={8} />
          <Text color="c2">{t('based_on_reviews', { reviews: data.reviews?.count })}</Text>
          <Space height={4} />
          <Rating disabled initialRating={data.rating!} />
          <Space height={4} />
        </Column>
      </Row>
    </TouchableOpacity>
  );
};

export default SearchBook;
