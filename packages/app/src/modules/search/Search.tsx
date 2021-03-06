import { Suspense, useState } from 'react';
import { ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { css, useTheme } from 'styled-components/native';

import { Column, Space, Text, TextInput } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

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

  const { t } = useTranslation();

  const theme = useTheme();

  const query = useLazyLoadQuery<SearchQuery>(
    graphql`
      query SearchQuery {
        ...SearchList_query
        ...CategoryDropdown_query
      }
    `,
    {},
  );

  return (
    <Column flex={1} css={containerCss}>
      <Column>
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder={t('search_for_bool_author_etc')}
          showErrorContainer={false}
          icon={<Ionicons name="ios-search-outline" size={20} color={theme.colors.c3} />}
        />
        <Space height={10} />
        <TouchableOpacity onPress={() => setDropdownVisible(true)}>
          <Text size="label" color="c5">
            {selectedCategory ? t('category_', { category: selectedCategory.name }) : t('all_categories')}
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
