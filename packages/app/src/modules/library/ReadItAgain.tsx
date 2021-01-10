import React, { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay/hooks';

import { BookCard, FlatListLoader } from '@workspace/ui';

import { ReadItAgainPaginationQuery } from './__generated__/ReadItAgainPaginationQuery.graphql';
import { ReadItAgain_query$key } from './__generated__/ReadItAgain_query.graphql';

interface ReadItAgainProps {
  query: ReadItAgain_query$key;
}

const ReadItAgain = (props: ReadItAgainProps) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment<
    ReadItAgainPaginationQuery,
    ReadItAgain_query$key
  >(
    graphql`
      fragment ReadItAgain_query on Query
      @argumentDefinitions(first: { type: Int, defaultValue: 10 }, after: { type: String })
      @refetchable(queryName: "ReadItAgainPaginationQuery") {
        finished: readings(first: $first, after: $after, filters: { finished: true })
          @connection(key: "ReadItAgain_finished", filters: []) {
          edges {
            node {
              id
              book {
                id
                ...BookCard_book
              }
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

  const renderCard = useCallback<ListRenderItem<typeof data.finished.edges[0]>>(
    ({ index, item }) => <BookCard index={index} query={item?.node.book} />,
    [],
  );

  // @TODO - move this list to ui package
  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.finished.edges}
      keyExtractor={(item) => item?.node?.id}
      renderItem={renderCard}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoadingNext ? <FlatListLoader height={60} /> : null}
    />
  );
};

export default ReadItAgain;
