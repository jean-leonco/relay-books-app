import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay/hooks';

import { BookCard, FlatListLoader } from '@workspace/ui';

import useKeyExtractor from '../common/useKeyExtractor';

import { ReleasesSection_query$key } from './__generated__/ReleasesSection_query.graphql';
import { ReleasesSectionPaginationQuery } from './__generated__/ReleasesSectionPaginationQuery.graphql';

interface ReleasesSectionProps {
  releases: ReleasesSection_query$key;
}

const ReleasesSection = (props: ReleasesSectionProps) => {
  const { data, loadNext, isLoadingNext, hasNext } = usePaginationFragment<
    ReleasesSectionPaginationQuery,
    ReleasesSection_query$key
  >(
    graphql`
      fragment ReleasesSection_query on Query
      @argumentDefinitions(first: { type: Int, defaultValue: 10 }, after: { type: String })
      @refetchable(queryName: "ReleasesSectionPaginationQuery") {
        releases: books(first: $first, after: $after) @connection(key: "ReleasesSection_releases", filters: []) {
          edges {
            node {
              id
              ...BookCard_book
            }
          }
        }
      }
    `,
    props.releases,
  );

  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) {
      return;
    }
    loadNext(10);
  }, [isLoadingNext, loadNext, hasNext]);

  const renderCard = useCallback(({ index, item }) => <BookCard index={index} query={item?.node} />, []);
  const keyExtractor = useKeyExtractor();

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.releases.edges}
      keyExtractor={keyExtractor}
      renderItem={renderCard}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoadingNext ? <FlatListLoader /> : null}
    />
  );
};

export default ReleasesSection;
