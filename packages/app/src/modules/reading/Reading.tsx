import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ToastAndroid, TouchableOpacity } from 'react-native';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';
import { css, useTheme } from 'styled-components/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';
import useRouteWithParams from '../hooks/useRouteWithParams';

import { ReadingQuery } from './__generated__/ReadingQuery.graphql';
import {
  ReadingEditPageInput,
  ReadingEditPageMutation,
} from './mutations/__generated__/ReadingEditPageMutation.graphql';

import {
  ReadingEditPage,
  getReadingEditPageOptimisticResponse,
  getReadingEditPageUpdater,
} from './mutations/ReadingEditPageMutation';

const headerCss = css`
  background: ${(p) => p.theme.colors.background};
  padding: 24px 24px 12px;
  width: 100%;
`;

const { width, height } = Dimensions.get('window');
const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };

const Reading = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();
  const route = useRouteWithParams<{ id: string }>();

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
              pages
            }
          }
        }
      }
    `,
    { id: route.params.id },
  );

  const [initialPage] = useState(data.reading?.readPages);

  const handlePageChange = useCallback(
    (currentPage) => {
      const input: ReadingEditPageInput = { id: route.params.id, currentPage };

      readingEditPage({
        variables: { input },
        onCompleted: ({ ReadingEditPage }) => {
          if (!ReadingEditPage || ReadingEditPage.error) {
            ToastAndroid.show(ReadingEditPage?.error || t('unable_to_update_read_pages'), ToastAndroid.SHORT);
            return;
          }
        },
        onError: (error) => {
          ToastAndroid.show(error?.message || t('unable_to_update_read_pages'), ToastAndroid.SHORT);
        },
        optimisticResponse: getReadingEditPageOptimisticResponse({
          id: route.params.id,
          currentPage,
          book: data.reading!.book,
        }),
        updater: getReadingEditPageUpdater({
          input,
          bookPages: data.reading!.book!.pages!,
          bookId: data.reading!.book!.id,
        }),
      });
    },
    [route.params.id, readingEditPage, data, t],
  );

  if (!data.reading) {
    return null;
  }

  return (
    <Column flex={1} align="center" justify="flex-start">
      <Row align="center" justify="space-between" css={headerCss}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="ios-chevron-back-outline" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text size="button" weight="bold">
          {data.reading.book!.name}
        </Text>
        <Space />
      </Row>
      <Pdf
        source={source}
        onPageChanged={handlePageChange}
        enablePaging
        horizontal
        page={initialPage as number}
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
