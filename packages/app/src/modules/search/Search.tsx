import React, { useCallback, useState, useTransition } from 'react';
import { FlatList, Modal, TouchableOpacity } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay/hooks';
import { css, useTheme } from 'styled-components/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Column, FlatListLoader, Space, Text, TextInput } from '@booksapp/ui';
import { useDebounce } from '@booksapp/hooks';

import { SearchQuery } from './__generated__/SearchQuery.graphql';
import { SearchRefetchQuery, SearchRefetchQueryVariables } from './__generated__/SearchRefetchQuery.graphql';
import { Search_query$key } from './__generated__/Search_query.graphql';
import CategoryDropdown from './CategoryDropdown';
import SearchBook from './SearchBook';

const containerCss = css`
  padding: 24px 8px 0;
  background: ${(p) => p.theme.colors.background};
`;

const Search = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [startTransition, isPending] = useTransition({ timeoutMs: 2000 });

  const query = useLazyLoadQuery<SearchQuery>(
    graphql`
      query SearchQuery {
        ...Search_query
        ...CategoryDropdown_query
      }
    `,
    { visible: isDropdownVisible },
  );

  // @TODO - fix useTransition
  const { data, hasNext, loadNext, isLoadingNext, refetch } = usePaginationFragment<
    SearchRefetchQuery,
    Search_query$key
  >(
    graphql`
      fragment Search_query on Query
      @argumentDefinitions(
        first: { type: Int, defaultValue: 20 }
        after: { type: String }
        filters: { type: BookFilters, defaultValue: { search: "" } }
      )
      @refetchable(queryName: "SearchRefetchQuery") {
        books(first: $first, after: $after, filters: $filters) @connection(key: "Search_books") {
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
    query,
  );

  const refetchSearch = useCallback(
    (value: string) => {
      startTransition(() => {
        const variables: SearchRefetchQueryVariables = { first: 20, filters: { search: value } };

        refetch(variables, { fetchPolicy: 'store-or-network' });
      });
    },
    [refetch],
  );

  const handleSearch = useDebounce(refetchSearch, 500, { leading: false });

  const handleSelectCategory = useCallback(
    (category?: any) => {
      setSelectedCategory(category);
      startTransition(() => {
        const variables: SearchRefetchQueryVariables = {
          first: 20,
          filters: { search: searchValue, ...(category ? { category: category.id } : {}) },
        };

        refetch(variables, { fetchPolicy: 'store-or-network' });
      });
    },
    [refetch, searchValue],
  );

  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) {
      return;
    }

    loadNext(20);
  }, [hasNext, isLoadingNext, loadNext]);

  const theme = useTheme();

  return (
    <Column flex={1} css={containerCss}>
      <Column>
        <TextInput
          value={searchValue}
          onChangeText={(value) => {
            setSearchValue(value);
            handleSearch(value);
          }}
          placeholder="Search for movie, author, etc."
          showErrorContainer={false}
          icon={<Ionicons name="ios-search-outline" size={20} color={theme.colors.c3} />}
        />
        <Space height={10} />
        <TouchableOpacity onPress={() => setDropdownVisible(true)}>
          <Text size="label" color="c5">
            {selectedCategory ? `Category: ${selectedCategory.name}` : 'All Categories'}
          </Text>
        </TouchableOpacity>
      </Column>
      <Space height={4} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data.books.edges}
        keyExtractor={(item) => item.node.id}
        renderItem={({ item }) => <SearchBook book={item?.node} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={isLoadingNext ? <FlatListLoader height={60} /> : null}
      />
      <Space height={4} />
      <Modal
        transparent
        animationType="slide"
        visible={isDropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <CategoryDropdown
          catogories={query}
          handleClose={() => setDropdownVisible(false)}
          handleSelectCategory={handleSelectCategory}
        />
      </Modal>
    </Column>
  );
};

export default Search;
