import React, { useCallback, useEffect, useTransition } from 'react';
import { FlatList } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay/hooks';

import { FlatListLoader } from '@booksapp/ui';

import SearchBook from './SearchBook';

import {
  SearchListRefetchQuery,
  SearchListRefetchQueryVariables,
} from './__generated__/SearchListRefetchQuery.graphql';
import { SearchList_query$key } from './__generated__/SearchList_query.graphql';

interface SearchListProps {
  query: SearchList_query$key;
  category: any;
  search: string;
}

const SearchList = ({ category, search, ...props }: SearchListProps) => {
  const [startTransition, isPending] = useTransition();

  const { data, hasNext, loadNext, isLoadingNext, refetch } = usePaginationFragment<
    SearchListRefetchQuery,
    SearchList_query$key
  >(
    graphql`
      fragment SearchList_query on Query
      @argumentDefinitions(
        first: { type: Int, defaultValue: 20 }
        after: { type: String }
        filters: { type: BookFilters, defaultValue: { search: "" } }
      )
      @refetchable(queryName: "SearchListRefetchQuery") {
        books(first: $first, after: $after, filters: $filters) @connection(key: "SearchList_books") {
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
            cursor
            node {
              id
              ...SearchBook_book
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

    loadNext(20);
  }, [hasNext, isLoadingNext, loadNext]);

  useEffect(() => {
    startTransition(() => {
      const variables: SearchListRefetchQueryVariables = {
        first: 20,
        filters: { search, ...(category ? { category: category.id } : {}) },
      };

      refetch(variables, { fetchPolicy: 'store-or-network' });
    });
  }, [search, category, refetch]);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={data.books.edges}
      style={{ paddingVertical: 4 }}
      keyExtractor={(item) => item.node.id}
      renderItem={({ item }) => <SearchBook book={item?.node} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoadingNext ? <FlatListLoader height={60} /> : null}
    />
  );
};

export default SearchList;
