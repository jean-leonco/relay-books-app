import { useCallback, useMemo } from 'react';
import * as React from 'react';
import { Animated, FlatList } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { FlatListLoader, Space } from '@workspace/ui';

import useKeyExtractor from '../common/useKeyExtractor';

import ReviewCard from '../review/ReviewCard';

import { BookReviews_book$key } from './__generated__/BookReviews_book.graphql';
import { BookReviewsPaginationQuery } from './__generated__/BookReviewsPaginationQuery.graphql';

interface BookReviewsProps {
  query: BookReviews_book$key;
  scrollY: Animated.Value;
  ListHeaderComponent: React.ReactElement | null;
}

const BookReviews = ({ scrollY, ListHeaderComponent, ...props }: BookReviewsProps) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment<
    BookReviewsPaginationQuery,
    BookReviews_book$key
  >(
    graphql`
      fragment BookReviews_book on Book
      @argumentDefinitions(first: { type: Int, defaultValue: 10 }, after: { type: String })
      @refetchable(queryName: "BookReviewsPaginationQuery") {
        reviews(first: $first, after: $after) @connection(key: "BookReviews_reviews", filters: []) {
          edges {
            node {
              id
              ...ReviewCard_review @arguments(hasUserName: true)
            }
          }
        }
      }
    `,
    props.query,
  );

  const keyExtractor = useKeyExtractor();

  const ListFooterComponent = useMemo(
    () =>
      isLoadingNext ? (
        <>
          <FlatListLoader height={60} />
          <Space height={50} />
        </>
      ) : (
        <Space height={50} />
      ),
    [isLoadingNext],
  );

  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) {
      return;
    }
    loadNext(10);
  }, [isLoadingNext, loadNext, hasNext]);

  const renderCard = useCallback(({ item }) => <ReviewCard query={item?.node} />, []);

  return (
    <FlatList
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      data={data?.reviews?.edges}
      keyExtractor={keyExtractor}
      style={{ marginBottom: 14 }}
      renderItem={renderCard}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={ListFooterComponent}
    />
  );
};

export default BookReviews;
