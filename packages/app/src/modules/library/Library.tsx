import React, { useMemo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, Space, Text } from '@booksapp/ui';

import { LibraryQuery } from './__generated__/LibraryQuery.graphql';
import ReadItAgain from './ReadItAgain';
import ContinueReading from './ContinueReading';

const containerCss = css`
  padding: 24px 0 0;
  background: ${(p) => p.theme.colors.background};
`;

const spacingCss = css`
  padding: 0 16px;
`;

const Library = () => {
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
      { title: 'Read it again', render: () => <ReadItAgain query={data} /> },
      { title: 'Continue Reading', render: () => <ContinueReading query={data} /> },
    ],
    [data],
  );

  if (data.readings.count === 0) {
    return (
      <Column align="center" justify="center" flex={1} css={containerCss}>
        <Text size="button">How don't have any read book yet</Text>
        <Space height={10} />
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text size="label" color="primary">
            Take to search
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
              My Library
            </Text>
            <Space height={40} />
          </>
        }
        showsVerticalScrollIndicator={false}
        data={list}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <>
            <Text size="button" css={spacingCss}>
              {item.title}
            </Text>
            <Space height={10} />
            {item.render()}
            <Space height={20} />
          </>
        )}
      />
    </Column>
  );
};

export default Library;
