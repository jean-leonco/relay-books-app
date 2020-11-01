import React, { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay/hooks';
import { useNavigation } from '@react-navigation/native';

import MainBookCard from './MainBookCard';
import { LastReadingSection_query$key } from './__generated__/LastReadingSection_query.graphql';

interface LastReadingSectionProps {
  lastReading: LastReadingSection_query$key;
}

const LastReadingSection = (props: LastReadingSectionProps) => {
  const navigation = useNavigation();

  const data = useFragment<LastReadingSection_query$key>(
    graphql`
      fragment LastReadingSection_query on Query {
        lastReading: readings(first: 1, filters: { finished: false })
          @connection(key: "LastReadingSection_lastReading", filters: []) {
          count
          totalCount
          endCursorOffset
          startCursorOffset
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            cursor
            node {
              id
              readPages
              book {
                pages
                ...MainBookCard_book
              }
            }
          }
        }
      }
    `,
    props.lastReading,
  );

  const lastReading = useMemo(() => (data.lastReading?.edges[0] ? data.lastReading.edges[0] : null), [
    data.lastReading,
  ]);

  const percentageCompleted = useMemo(() => {
    if (!lastReading || !lastReading.node.book) {
      return 0;
    }

    return Number(((lastReading.node.readPages! * 100) / lastReading.node.book.pages!).toFixed(0));
  }, [lastReading]);

  const handlePress = useCallback(() => {
    navigation.navigate('Reading', { id: lastReading.node.id });
  }, [lastReading, navigation]);

  return (
    <MainBookCard
      book={data.lastReading.edges[0]?.node.book}
      percentageCompleted={percentageCompleted}
      onPress={handlePress}
    />
  );
};

export default LastReadingSection;
