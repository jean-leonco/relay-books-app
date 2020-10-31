import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay/hooks';

import { FlatListLoader } from '@booksapp/ui';

import ReadingCard from './ReadingCard';
import { ContinueReading_query$key } from './__generated__/ContinueReading_query.graphql';
import { ContinueReadingPaginationQuery } from './__generated__/ContinueReadingPaginationQuery.graphql';

interface ContinueReadingProps {
  query: ContinueReading_query$key;
}

const ContinueReading = (props: ContinueReadingProps) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment<
    ContinueReadingPaginationQuery,
    ContinueReading_query$key
  >(
    graphql`
      fragment ContinueReading_query on Query
      @argumentDefinitions(first: { type: Int, defaultValue: 10 }, after: { type: String })
      @refetchable(queryName: "ContinueReadingPaginationQuery") {
        unfinished: readings(first: $first, after: $after, filters: { finished: false })
          @connection(key: "ContinueReading_unfinished", filters: []) {
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
              ...ReadingCard_reading
            }
          }
        }
      }
    `,
    props.query,
  );

  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) {
      return;
    }
    loadNext(10);
  }, [isLoadingNext, loadNext, hasNext]);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 16 }}
      data={data.unfinished.edges}
      keyExtractor={(item) => item.node.id}
      renderItem={({ item, index }) => <ReadingCard query={item.node} index={index} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoadingNext ? <FlatListLoader /> : null}
    />
  );
};

export default ContinueReading;
