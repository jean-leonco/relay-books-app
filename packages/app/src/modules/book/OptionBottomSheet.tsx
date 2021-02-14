import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useFragment, useMutation } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';

import { Column, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';
import useRouteWithParams from '../hooks/useRouteWithParams';

import { OptionBottomSheet_book$key } from './__generated__/OptionBottomSheet_book.graphql';
import { ReadingRemoveMutation } from './mutations/__generated__/ReadingRemoveMutation.graphql';

import { ReadingRemove, getReadingRemoveMutationUpdater } from './mutations/ReadingRemoveMutation';

const containerCss = css`
  background: ${(p) => p.theme.colors.background};
`;

const Button = styled.TouchableOpacity`
  padding: 15px 5px;
`;

interface OptionBottomSheetProps {
  handleClose(): void;
  query: OptionBottomSheet_book$key;
}

const OptionBottomSheet = ({ handleClose, ...props }: OptionBottomSheetProps) => {
  const { t } = useTranslation();

  const navigation = useNavigation();
  const route = useRouteWithParams<{ id: string }>();

  const { meReading, pages, meCanReview } = useFragment<OptionBottomSheet_book$key>(
    graphql`
      fragment OptionBottomSheet_book on Book {
        pages
        meCanReview
        meReading {
          id
          readPages
        }
      }
    `,
    props.query,
  );

  const [readingRemove] = useMutation<ReadingRemoveMutation>(ReadingRemove);

  const handleRemoveFromLibrary = useCallback(async () => {
    readingRemove({
      variables: { input: { id: meReading!.id } },
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
      updater: getReadingRemoveMutationUpdater(meReading!.readPages === pages!),
    });
  }, [readingRemove, meReading, pages, t, navigation, handleClose]);

  const handleReview = useCallback(() => {
    navigation.navigate('ReviewAdd', { bookId: route.params.id });
    handleClose();
  }, [handleClose, navigation, route.params.id]);

  const photoOptions = useMemo(
    () => [
      ...(meCanReview ? [{ label: t('review'), onPress: handleReview }] : []),
      ...(meReading ? [{ label: t('remove_from_library'), onPress: handleRemoveFromLibrary }] : []),
      { label: t('close'), onPress: handleClose },
    ],
    [meCanReview, t, handleReview, meReading, handleRemoveFromLibrary, handleClose],
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
