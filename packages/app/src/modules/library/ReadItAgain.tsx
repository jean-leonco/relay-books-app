import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { BookCard, FlatListLoader } from '@workspace/ui';

import useKeyExtractor from '../common/useKeyExtractor';

import { ReadItAgain_query$key } from './__generated__/ReadItAgain_query.graphql';
import { ReadItAgainPaginationQuery } from './__generated__/ReadItAgainPaginationQuery.graphql';

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

  const renderCard = useCallback(({ index, item }) => <BookCard index={index} query={item?.node.book} />, []);
  const keyExtractor = useKeyExtractor();

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.finished.edges}
      keyExtractor={keyExtractor}
      renderItem={renderCard}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoadingNext ? <FlatListLoader height={60} /> : null}
    />
  );
};

export default ReadItAgain;
