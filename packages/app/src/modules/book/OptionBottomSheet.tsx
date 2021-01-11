import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import styled, { css } from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';

import { Column, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import { ReadingRemove, getReadingRemoveMutationUpdater } from './mutations/ReadingRemoveMutation';
import { ReadingRemoveMutation } from './mutations/__generated__/ReadingRemoveMutation.graphql';

import { OptionBottomSheetQuery } from './__generated__/OptionBottomSheetQuery.graphql';

const containerCss = css`
  background: ${(p) => p.theme.colors.background};
`;

const Button = styled.TouchableOpacity`
  padding: 15px 5px;
`;

const OptionBottomSheet = ({ handleClose }) => {
  const { t } = useTranslation();

  const [readingRemove] = useMutation<ReadingRemoveMutation>(ReadingRemove);

  const navigation = useNavigation();
  const route = useRoute();

  const data = useLazyLoadQuery<OptionBottomSheetQuery>(
    graphql`
      query OptionBottomSheetQuery($filters: ReadingFilters) {
        readings(first: 1, filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                id
                pages
                meCanReview
              }
            }
          }
        }
      }
    `,
    { filters: { book: route.params.id } },
  );

  const reading = useMemo(() => {
    if (!data.readings || !data.readings.edges[0]) {
      return null;
    }

    return data.readings.edges[0].node;
  }, [data]);

  const handleRemoveFromLibrary = useCallback(async () => {
    readingRemove({
      variables: { input: { id: reading!.id } },
      onCompleted: ({ ReadingRemove }) => {
        if (!ReadingRemove || ReadingRemove.error) {
          ToastAndroid.show(ReadingRemove?.error || t('unable_to_remove_book'), ToastAndroid.SHORT);
          return;
        }

        ToastAndroid.show(t('book_removed_with_success'), ToastAndroid.SHORT);

        navigation.goBack();
        handleClose();
      },
      onError: (error) => {
        ToastAndroid.show(error?.message || t('unable_to_remove_book'), ToastAndroid.SHORT);

        navigation.goBack();
        handleClose();
      },
      updater: getReadingRemoveMutationUpdater(reading!.readPages === reading!.book!.pages),
    });
  }, [handleClose, navigation, reading, readingRemove, t]);

  const handleReview = useCallback(() => {
    navigation.navigate('ReviewAdd', { bookId: route.params.id });
    handleClose();
  }, [handleClose, navigation, route.params.id]);

  const photoOptions = useMemo(
    () => [
      ...(reading?.book?.meCanReview ? [{ label: t('review'), onPress: handleReview }] : []),
      ...(reading ? [{ label: t('remove_from_library'), onPress: handleRemoveFromLibrary }] : []),
      { label: t('close'), onPress: handleClose },
    ],
    [reading, t, handleReview, handleRemoveFromLibrary, handleClose],
  );

  return (
    <Column css={containerCss}>
      {photoOptions.map((option) => (
        <Button key={option.label} onPress={option.onPress}>
          <Text size="button">{option.label}</Text>
        </Button>
      ))}
    </Column>
  );
};

export default OptionBottomSheet;
