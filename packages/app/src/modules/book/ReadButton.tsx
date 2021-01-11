import React, { useCallback, useMemo, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useFragment, useMutation } from 'react-relay/hooks';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import { ReadingAdd, getReadingAddUpdater } from './mutations/ReadingAddMutation';
import { ReadingAddMutation } from './mutations/__generated__/ReadingAddMutation.graphql';
import { ReadItAgain, getReadItAgainUpdater } from './mutations/ReadItAgainMutation';
import { ReadItAgainMutation } from './mutations/__generated__/ReadItAgainMutation.graphql';

import { ReadButton_query$key } from './__generated__/ReadButton_query.graphql';

const buttonCss = css`
  position: absolute;
  bottom: 10px;
  left: 24px;
  right: 24px;
`;

interface ReadButtonProps {
  query: ReadButton_query$key;
  bookId: string;
}

const ReadButton = ({ bookId, ...props }: ReadButtonProps) => {
  const [isSubmitting, setSubmitting] = useState(false);

  const { t } = useTranslation();

  const [readingAdd] = useMutation<ReadingAddMutation>(ReadingAdd);
  const [readItAgain] = useMutation<ReadItAgainMutation>(ReadItAgain);

  const navigation = useNavigation();

  const data = useFragment<ReadButton_query$key>(
    graphql`
      fragment ReadButton_query on Query @argumentDefinitions(filters: { type: ReadingFilters }) {
        readings(first: 1, filters: $filters) @connection(key: "ReadButton_readings", filters: []) {
          count
          edges {
            node {
              id
              readPages
              book {
                id
                pages
              }
            }
          }
        }
      }
    `,
    props.query,
  );

  const reading = useMemo(() => (data.readings.edges.length > 0 ? data.readings.edges[0]?.node : null), [
    data.readings,
  ]);

  const label = useMemo(() => {
    if (data.readings.count === 0) {
      return t('start_reading');
    }

    if (reading?.readPages < reading?.book.pages) {
      return t('continue_to_read');
    } else if (reading?.readPages >= reading?.book.pages) {
      return t('read_it_again');
    }
  }, [data.readings.count, reading, t]);

  const handlePress = useCallback(() => {
    if (label === t('start_reading')) {
      readingAdd({
        variables: { input: { bookId } },
        onCompleted: ({ ReadingAdd }) => {
          setSubmitting(false);

          if (!ReadingAdd || ReadingAdd.error) {
            ToastAndroid.show(ReadingAdd?.error || t('unable_to_create_reading'), ToastAndroid.SHORT);
            return;
          }

          navigation.navigate('Reading', { id: ReadingAdd.readingEdge?.node?.id });
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || t('unable_to_create_reading'), ToastAndroid.SHORT);
        },
        updater: getReadingAddUpdater,
      });
    } else if (label === t('read_it_again')) {
      setSubmitting(true);

      readItAgain({
        variables: { input: { id: reading!.id, currentPage: 1 } },
        onCompleted: ({ ReadingEditPage }) => {
          setSubmitting(false);

          if (!ReadingEditPage || ReadingEditPage.error) {
            ToastAndroid.show(ReadingEditPage?.error || t('unable_to_update_read_pages'), ToastAndroid.SHORT);
            return;
          }

          navigation.navigate('Reading', { id: ReadingEditPage.readingEdge?.node?.id });
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || t('unable_to_update_read_pages'), ToastAndroid.SHORT);
        },
        updater: getReadItAgainUpdater(reading!.id),
      });
    } else if (label === t('continue_to_read')) {
      navigation.navigate('Reading', { id: reading?.id });
    }
  }, [bookId, label, navigation, readItAgain, reading, readingAdd, t]);

  return (
    <Button onPress={handlePress} buttonCss={buttonCss} loading={isSubmitting}>
      {label}
    </Button>
  );
};

export default ReadButton;
