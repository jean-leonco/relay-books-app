import React, { useCallback, useMemo, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { graphql, useFragment, useMutation } from 'react-relay/hooks';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@workspace/ui';

import { ReadingAdd, readingAddUpdater } from './mutations/ReadingAddMutation';
import { ReadingAddMutation } from './mutations/__generated__/ReadingAddMutation.graphql';
import { ReadItAgain, readItAgainUpdater } from './mutations/ReadItAgainMutation';
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
      return 'Start Reading';
    }

    if (reading?.readPages < reading?.book.pages) {
      return 'Continue to Read';
    } else if (reading?.readPages >= reading?.book.pages) {
      return 'Read It Again';
    }
  }, [data.readings, reading]);

  const handlePress = useCallback(() => {
    if (label === 'Start Reading') {
      readingAdd({
        variables: { input: { bookId } },
        onCompleted: ({ ReadingAdd }) => {
          setSubmitting(false);

          if (!ReadingAdd || ReadingAdd.error) {
            ToastAndroid.show(ReadingAdd?.error || 'Unable to create reading', ToastAndroid.SHORT);
            return;
          }

          navigation.navigate('Reading', { id: ReadingAdd.readingEdge?.node?.id });
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || 'Unable to create reading', ToastAndroid.SHORT);
        },
        updater: readingAddUpdater,
      });
    } else if (label === 'Read It Again') {
      setSubmitting(true);

      readItAgain({
        variables: { input: { id: reading!.id, currentPage: 1 } },
        onCompleted: ({ ReadingEditPage }) => {
          setSubmitting(false);

          if (!ReadingEditPage || ReadingEditPage.error) {
            ToastAndroid.show(ReadingEditPage?.error || 'Unable to update read pages', ToastAndroid.SHORT);
            return;
          }

          navigation.navigate('Reading', { id: ReadingEditPage.readingEdge?.node?.id });
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || 'Unable to update read pages', ToastAndroid.SHORT);
        },
        updater: readItAgainUpdater(reading!.id),
      });
    } else if (label === 'Continue to Read') {
      navigation.navigate('Reading', { id: reading?.id });
    }
  }, [bookId, label, navigation, readItAgain, reading, readingAdd]);

  return (
    <Button onPress={handlePress} buttonCss={buttonCss} loading={isSubmitting}>
      {label}
    </Button>
  );
};

export default ReadButton;
