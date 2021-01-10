import React, { useCallback, useMemo } from 'react';
import { FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import ContinueReading from './ContinueReading';
import ReadItAgain from './ReadItAgain';

import { LibraryQuery } from './__generated__/LibraryQuery.graphql';

const containerCss = css`
  padding: 24px 0 0;
  background: ${(p) => p.theme.colors.background};
`;

const spacingCss = css`
  padding: 0 16px;
`;

const Library = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const data = useLazyLoadQuery<LibraryQuery>(
    graphql`
      query LibraryQuery {
        readings(first: 1) {
          count
        }
        ...ContinueReading_query
        ...ReadItAgain_query
      }
    `,
    {},
  );

  const list = useMemo(
    () => [
      { title: t('read_it_again'), render: () => <ReadItAgain query={data} /> },
      { title: t('continue_reading'), render: () => <ContinueReading query={data} /> },
    ],
    [data, t],
  );

  const renderCard = useCallback<ListRenderItem<typeof list[0]>>(
    ({ item }) => (
      <>
        <Text size="button" css={spacingCss}>
          {item.title}
        </Text>
        <Space height={10} />
        {item.render()}
        <Space height={20} />
      </>
    ),
    [],
  );

  if (data.readings.count === 0) {
    return (
      <Column align="center" justify="center" flex={1} css={containerCss}>
        <Text size="button">{t('you_dont_have_any_read_book_yet')}</Text>
        <Space height={10} />
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text size="label" color="primary">
            {t('take_me_to_search')}
          </Text>
        </TouchableOpacity>
      </Column>
    );
  }

  return (
    <Column flex={1} css={containerCss}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text size="title" weight="bold" css={spacingCss}>
              {t('my_library')}
            </Text>
            <Space height={40} />
          </>
        }
        showsVerticalScrollIndicator={false}
        data={list}
        keyExtractor={(item) => item.title}
        renderItem={renderCard}
      />
    </Column>
  );
};

export default Library;
