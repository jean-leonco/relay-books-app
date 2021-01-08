import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import styled, { css } from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';

import { BottomSheetProps, Column, Text } from '@workspace/ui';

import { ReadingRemove, readingsRemoveMutationConnectionUpdater } from './mutations/ReadingRemoveMutation';
import { ReadingRemoveMutation } from './mutations/__generated__/ReadingRemoveMutation.graphql';

import { OptionBottomSheetQuery } from './__generated__/OptionBottomSheetQuery.graphql';

const containerCss = css`
  background: ${(p) => p.theme.colors.background};
`;

const Button = styled.TouchableOpacity`
  padding: 15px 5px;
`;

const OptionBottomSheet = ({ handleClose }: BottomSheetProps) => {
  const [readingRemove] = useMutation<ReadingRemoveMutation>(ReadingRemove);

  const navigation = useNavigation();
  const route = useRoute();

  const data = useLazyLoadQuery<OptionBottomSheetQuery>(
    graphql`
      query OptionBottomSheetQuery($filters: ReadingFilters) {
        readings(first: 1, filters: $filters) {
          count
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
          ToastAndroid.show(ReadingRemove?.error || 'Unable to remove book', ToastAndroid.SHORT);
          return;
        }

        ToastAndroid.show('Book removed with success', ToastAndroid.SHORT);

        navigation.goBack();
        handleClose();
      },
      onError: (error) => {
        ToastAndroid.show(error?.message || 'Unable to remove book', ToastAndroid.SHORT);

        navigation.goBack();
        handleClose();
      },
      updater: readingsRemoveMutationConnectionUpdater(reading!.readPages === reading!.book!.pages),
    });
  }, [handleClose, navigation, reading, readingRemove]);

  const handleReview = useCallback(() => {
    navigation.navigate('Review', { bookId: route.params.id });
    handleClose();
  }, [handleClose, navigation, route.params.id]);

  const photoOptions = useMemo(
    () => [
      ...(reading?.book?.meCanReview ? [{ label: 'Review', onPress: handleReview }] : []),
      ...(reading ? [{ label: 'Remove From Library', onPress: handleRemoveFromLibrary }] : []),
      { label: 'Close', onPress: handleClose },
    ],
    [handleRemoveFromLibrary, reading, handleReview, handleClose],
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
