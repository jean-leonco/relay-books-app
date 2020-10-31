import React, { Suspense, useCallback, useRef, useState } from 'react';
import { FlatList, Animated, StatusBar } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay/hooks';
import { useRoute } from '@react-navigation/native';
import { css } from 'styled-components/native';

import { BottomSheet, Button, Column, FlatListLoader, Space } from '@booksapp/ui';

import { BookDetailsQuery } from './__generated__/BookDetailsQuery.graphql';
import { BookDetailsPaginationQuery } from './__generated__/BookDetailsPaginationQuery.graphql';
import { BookDetails_book$key } from './__generated__/BookDetails_book.graphql';

import ReviewCard from './ReviewCard';
import BookInfo from './BookInfo';
import OptionBottomSheet from './OptionBottomSheet';
import BookHeader from './BookHeader';

const containerCss = css`
  padding: 48px 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const buttonCss = css`
  position: absolute;
  bottom: 10px;
  left: 24px;
  right: 24px;
`;

const BookDetails = () => {
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  const route = useRoute();

  const scrollY = useRef(new Animated.Value(0)).current;

  const query = useLazyLoadQuery<BookDetailsQuery>(
    graphql`
      query BookDetailsQuery($id: ID!) {
        book: node(id: $id) {
          ... on Book {
            ...BookHeader_book
            ...BookInfo_book
            ...BookDetails_book
          }
        }
      }
    `,
    { id: route.params.id },
  );

  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment<
    BookDetailsPaginationQuery,
    BookDetails_book$key
  >(
    graphql`
      fragment BookDetails_book on Book
      @argumentDefinitions(first: { type: Int, defaultValue: 10 }, after: { type: String })
      @refetchable(queryName: "BookDetailsPaginationQuery") {
        reviews(first: $first, after: $after) @connection(key: "BookDetails_reviews") {
          endCursorOffset
          startCursorOffset
          count
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              ...ReviewCard_review
            }
          }
        }
      }
    `,
    query.book,
  );

  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) {
      return;
    }
    loadNext(10);
  }, [isLoadingNext, loadNext, hasNext]);

  const handleSheetClose = useCallback(() => {
    setBottomSheetOpen(false);
  }, []);

  return (
    <Column flex={1} css={containerCss}>
      <StatusBar
        backgroundColor={isBottomSheetOpen ? 'rgba(0,0,0,0.6)' : '#f5f5f5'}
        barStyle={isBottomSheetOpen ? 'light-content' : 'dark-content'}
      />
      <BookHeader query={query.book} scrollY={scrollY} setBottomSheetOpen={setBottomSheetOpen} />
      <FlatList
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        ListHeaderComponent={<BookInfo query={query.book} />}
        showsVerticalScrollIndicator={false}
        data={data.reviews.edges}
        keyExtractor={(item) => item.node.id}
        style={{ marginBottom: 14 }}
        renderItem={({ item }) => <ReviewCard query={item.node} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingNext ? (
            <>
              <FlatListLoader height={60} />
              <Space height={50} />
            </>
          ) : (
            <Space height={50} />
          )
        }
      />
      <Button buttonCss={buttonCss}>Read</Button>
      <BottomSheet
        isVisible={isBottomSheetOpen}
        swipeDirection="down"
        style={{ flex: 1, margin: 0, justifyContent: 'flex-end' }}
        backdropOpacity={0.6}
        onBackButtonPress={handleSheetClose}
        onBackdropPress={handleSheetClose}
        onSwipeComplete={handleSheetClose}
      >
        <Suspense fallback={<FlatListLoader height={160} />}>
          <OptionBottomSheet handleClose={handleSheetClose} />
        </Suspense>
      </BottomSheet>
    </Column>
  );
};

export default BookDetails;
