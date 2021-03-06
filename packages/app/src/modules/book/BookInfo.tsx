import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import Rating from '../rating/Rating';

import { BookInfo_book$key } from './__generated__/BookInfo_book.graphql';

const Banner = styled.Image`
  background: ${(p) => p.theme.colors.c2};
  width: 200px;
  height: 280px;
  border-radius: 8px;
`;

const Separator = styled.View`
  background: ${(p) => p.theme.colors.c2};
  width: 1px;
  height: 70%;
  border-radius: 8px;
  margin: 0 20px;
`;

interface BookInfoProps {
  query: BookInfo_book$key;
}

const BookInfo = (props: BookInfoProps) => {
  const { t } = useTranslation();

  const data = useFragment<BookInfo_book$key>(
    graphql`
      fragment BookInfo_book on Book {
        bannerUrl
        name
        author
        rating
        pages
        releaseYear
        description
      }
    `,
    props.query,
  );

  return (
    <Column>
      <Column align="center" justify="center">
        <Banner source={{ uri: data.bannerUrl! }} />
        <Space height={15} />
        <Rating initialRating={data.rating!} disabled />
        <Space height={10} />
        <Text size="title" weight="bold" center>
          {data.name}
        </Text>
        <Space height={10} />
        <Text size="button" color="c3" center>
          {data.author}
        </Text>
        <Space height={30} />
        <Row align="center" justify="center">
          <Column align="center" justify="center">
            <Text size="button" weight="bold">
              {data.releaseYear}
            </Text>
            <Space height={4} />
            <Text color="c3">{t('year_of_release')}</Text>
          </Column>
          <Separator />
          <Column align="center" justify="center">
            <Text size="button" weight="bold">
              {data.pages}
            </Text>
            <Space height={4} />
            <Text color="c3">{t('amount_of_pages')}</Text>
          </Column>
        </Row>
        <Space height={40} />
      </Column>

      <Text size="button" weight="bold">
        {t('about')}
      </Text>
      <Space height={10} />
      <Text size="label" color="c3">
        {data.description}
      </Text>
      <Space height={30} />
      <Text size="button" weight="bold">
        {t('reviews')}
      </Text>
    </Column>
  );
};

export default BookInfo;
