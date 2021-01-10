import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay/hooks';

import { FlatListLoader } from '@workspace/ui';

import useKeyExtractor from '../common/useKeyExtractor';

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
          edges {
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

  const renderCard = useCallback(({ index, item }) => <ReadingCard query={item.node} index={index} />, []);
  const keyExtractor = useKeyExtractor();

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 16 }}
      data={data.unfinished.edges}
      keyExtractor={keyExtractor}
      renderItem={renderCard}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoadingNext ? <FlatListLoader height={50} /> : null}
    />
  );
};

export default ContinueReading;
