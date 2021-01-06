import React, { Suspense, useState } from 'react';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';
import { css, useTheme } from 'styled-components/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Column, Space, Text, TextInput } from '@workspace/ui';

import { SearchQuery } from './__generated__/SearchQuery.graphql';

import CategoryDropdown from './CategoryDropdown';
import SearchList from './SearchList';

const containerCss = css`
  padding: 24px 8px 0;
  background: ${(p) => p.theme.colors.background};
`;

const Search = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const theme = useTheme();

  const query = useLazyLoadQuery<SearchQuery>(
    graphql`
      query SearchQuery {
        ...SearchList_query
        ...CategoryDropdown_query
      }
    `,
    { visible: isDropdownVisible },
  );

  return (
    <Column flex={1} css={containerCss}>
      <Column>
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
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
      <Suspense
        fallback={
          <Column align="center">
            <Space height={10} />
            <ActivityIndicator size={28} color={theme.colors.primary} />
          </Column>
        }
      >
        <SearchList query={query} category={selectedCategory} search={searchValue} />
      </Suspense>
      <Modal
        transparent
        animationType="slide"
        visible={isDropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <CategoryDropdown
          catogories={query}
          handleClose={() => setDropdownVisible(false)}
          handleSelectCategory={setSelectedCategory}
        />
      </Modal>
    </Column>
  );
};

export default Search;
