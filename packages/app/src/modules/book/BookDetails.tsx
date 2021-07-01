import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StatusBar } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { css } from 'styled-components/native';

import { BottomSheet, Column } from '@workspace/ui';

import useRouteWithParams from '../hooks/useRouteWithParams';

import { BookDetailsQuery } from './__generated__/BookDetailsQuery.graphql';

import BookHeader from './BookHeader';
import BookInfo from './BookInfo';
import BookReviews from './BookReviews';
import OptionBottomSheet from './OptionBottomSheet';
import ReadButton from './ReadButton';

const containerCss = css`
  padding: 48px 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const BookDetails = () => {
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  const route = useRouteWithParams<{ id: string }>();

  const query = useLazyLoadQuery<BookDetailsQuery>(
    graphql`
      query BookDetailsQuery($id: ID!) {
        book: node(id: $id) {
          ... on Book {
            ...BookHeader_book
            ...BookInfo_book
            ...BookReviews_book
            ...ReadButton_book
            ...OptionBottomSheet_book
          }
        }
      }
    `,
    { id: route.params.id },
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const ListHeaderComponent = useMemo(() => (query.book ? <BookInfo query={query.book} /> : null), [query.book]);

  const handleSheetClose = useCallback(() => {
    setBottomSheetOpen(false);
  }, []);

  //@TODO - treat this cases
  if (!query.book) {
    return null;
  }

  return (
    <Column flex={1} css={containerCss}>
      <StatusBar
        backgroundColor={isBottomSheetOpen ? 'rgba(0,0,0,0.6)' : '#f5f5f5'}
        barStyle={isBottomSheetOpen ? 'light-content' : 'dark-content'}
      />
      <BookHeader query={query.book} scrollY={scrollY} setBottomSheetOpen={setBottomSheetOpen} />
      <BookReviews ListHeaderComponent={ListHeaderComponent} query={query.book} scrollY={scrollY} />
      <ReadButton query={query.book} bookId={route.params.id} />
      <BottomSheet
        isVisible={isBottomSheetOpen}
        swipeDirection="down"
        style={{ flex: 1, margin: 0, justifyContent: 'flex-end' }}
        backdropOpacity={0.6}
        onBackButtonPress={handleSheetClose}
        onBackdropPress={handleSheetClose}
        onSwipeComplete={handleSheetClose}
      >
        <OptionBottomSheet query={query.book} handleClose={handleSheetClose} />
      </BottomSheet>
    </Column>
  );
};

export default BookDetails;
