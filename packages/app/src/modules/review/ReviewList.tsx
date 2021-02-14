import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay/hooks';
import { css } from 'styled-components';

import { Column, FlatListLoader, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import useKeyExtractor from '../common/useKeyExtractor';

import { ReviewList_user$key } from './__generated__/ReviewList_user.graphql';
import { ReviewListPaginationQuery } from './__generated__/ReviewListPaginationQuery.graphql';
import { ReviewListQuery } from './__generated__/ReviewListQuery.graphql';

import ReviewCard from './ReviewCard';

const containerCss = css`
  padding: 40px 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const titleCss = css`
  margin-bottom: 20px;
`;

const ReviewList = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const { me } = useLazyLoadQuery<ReviewListQuery>(
    graphql`
      query ReviewListQuery {
        me {
          ...ReviewList_user
        }
      }
    `,
    {},
  );

  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment<
    ReviewListPaginationQuery,
    ReviewList_user$key
  >(
    graphql`
      fragment ReviewList_user on User
      @argumentDefinitions(first: { type: Int, defaultValue: 10 }, after: { type: String })
      @refetchable(queryName: "ReviewListPaginationQuery") {
        reviews(first: $first, after: $after) @connection(key: "ReviewList_reviews") {
          edges {
            node {
              id
              ...ReviewCard_review @arguments(hasBookName: true)
            }
          }
        }
      }
    `,
    me,
  );

  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) {
      return;
    }
    loadNext(10);
  }, [isLoadingNext, loadNext, hasNext]);

  const renderCard = useCallback(
    ({ item }) => (
      <ReviewCard query={item?.node} onPress={() => navigation.navigate('ReviewEdit', { id: item?.node?.id })} />
    ),
    [navigation],
  );
  const keyExtractor = useKeyExtractor();

  return (
    <Column flex={1} css={containerCss}>
      <FlatList
        ListHeaderComponent={
          <Text size="title" weight="bold" css={titleCss}>
            {t('my_reviews')}
          </Text>
        }
        showsVerticalScrollIndicator={false}
        data={data?.reviews.edges}
        keyExtractor={keyExtractor}
        renderItem={renderCard}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={isLoadingNext ? <FlatListLoader height={50} /> : null}
      />
    </Column>
  );
};

export default ReviewList;
