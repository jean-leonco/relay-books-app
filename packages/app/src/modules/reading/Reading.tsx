import React, { useCallback, useState } from 'react';
import { Dimensions, ActivityIndicator, TouchableOpacity, ToastAndroid } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { css, useTheme } from 'styled-components/native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';
import Pdf from 'react-native-pdf';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import {
  ReadingEditPage,
  readingEditPageOptimisticResponse,
  readingEditPageUpdater,
} from './mutations/ReadingEditPageMutation';
import {
  ReadingEditPageInput,
  ReadingEditPageMutation,
} from './mutations/__generated__/ReadingEditPageMutation.graphql';

import { ReadingQuery } from './__generated__/ReadingQuery.graphql';

const headerCss = css`
  background: ${(p) => p.theme.colors.background};
  padding: 24px 24px 12px;
  width: 100%;
`;

const { width, height } = Dimensions.get('window');
const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };

const Reading = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  const [readingEditPage] = useMutation<ReadingEditPageMutation>(ReadingEditPage);
  const data = useLazyLoadQuery<ReadingQuery>(
    graphql`
      query ReadingQuery($id: ID!) {
        reading: node(id: $id) {
          ... on Reading {
            id
            readPages
            book {
              id
              name
              bannerUrl
              pages
            }
          }
        }
      }
    `,
    { id: route.params.id },
  );

  const [initialPage] = useState(data.reading.readPages);

  const handlePageChange = useCallback(
    (currentPage) => {
      const input: ReadingEditPageInput = { id: route.params.id, currentPage };

      readingEditPage({
        variables: { input },
        onCompleted: ({ ReadingEditPage }) => {
          if (!ReadingEditPage || ReadingEditPage.error) {
            ToastAndroid.show(ReadingEditPage?.error || 'Unable to update read pages', ToastAndroid.SHORT);
            return;
          }
        },
        onError: (error) => {
          ToastAndroid.show(error?.message || 'Unable to update read pages', ToastAndroid.SHORT);
        },
        optimisticResponse: readingEditPageOptimisticResponse({
          id: route.params.id,
          currentPage,
          book: data.reading.book,
        }),
        updater: readingEditPageUpdater(input, data.reading.book.pages),
      });
    },
    [readingEditPage, route.params.id, data.reading.book],
  );

  return (
    <Column flex={1} align="center" justify="flex-start">
      <Row align="center" justify="space-between" css={headerCss}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="ios-chevron-back-outline" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text size="button" weight="bold">
          {data.reading.book.name}
        </Text>
        <Space />
      </Row>
      <Pdf
        source={source}
        onPageChanged={handlePageChange}
        enablePaging
        horizontal
        page={initialPage}
        activityIndicator={
          <Column align="center">
            <Space height={10} />
            <ActivityIndicator size={28} color={theme.colors.primary} />
          </Column>
        }
        style={{ flex: 1, backgroundColor: theme.colors.background, width, height }}
      />
    </Column>
  );
};

export default Reading;
