import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';
import { css, useTheme } from 'styled-components/native';

import { BookCard, Column, Text } from '@workspace/ui';

import useKeyExtractor from '../common/useKeyExtractor';

import { TrendingSection_query$key } from './__generated__/TrendingSection_query.graphql';

const bookCss = css`
  width: 190px;
`;

const bookBannerCss = css`
  width: 180px;
  height: 250px;
`;

const positionTextCss = css`
  position: absolute;
  left: 8px;
  bottom: 2px;
`;

interface TrendingSectionProps {
  trending: TrendingSection_query$key;
}

const TrendingSection = (props: TrendingSectionProps) => {
  const theme = useTheme();

  const data = useFragment<TrendingSection_query$key>(
    graphql`
      fragment TrendingSection_query on Query {
        trending: books(first: 10, filters: { trending: true }) {
          edges {
            node {
              id
              ...BookCard_book
            }
          }
        }
      }
    `,
    props.trending,
  );

  const renderCard = useCallback(
    ({ index, item }) => (
      <Column style={{ position: 'relative' }}>
        <BookCard index={index} query={item?.node} showName={false} containerCss={bookCss} bannerCss={bookBannerCss} />
        <Text
          size="extraLarge"
          color="white"
          css={positionTextCss}
          style={{
            marginLeft: index === 0 ? 12 : 0,
            textShadowColor: theme.colors.black,
            textShadowOffset: { width: 5, height: 5 },
            textShadowRadius: 10,
          }}
        >
          {index + 1}
        </Text>
      </Column>
    ),
    [theme.colors.black],
  );
  const keyExtractor = useKeyExtractor();

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.trending.edges}
      keyExtractor={keyExtractor}
      renderItem={renderCard}
    />
  );
};

export default TrendingSection;
