import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay/hooks';

import { LastReadingSection_user$key } from './__generated__/LastReadingSection_user.graphql';

import MainBookCard from './MainBookCard';

interface LastReadingSectionProps {
  lastReading: LastReadingSection_user$key;
}

const LastReadingSection = (props: LastReadingSectionProps) => {
  const navigation = useNavigation();

  const { lastIncompleteReading } = useFragment<LastReadingSection_user$key>(
    graphql`
      fragment LastReadingSection_user on User {
        lastIncompleteReading {
          id
          readPages
          book {
            pages
            ...MainBookCard_book
          }
        }
      }
    `,
    props.lastReading,
  );

  const percentageCompleted = useMemo(() => {
    if (!lastIncompleteReading || !lastIncompleteReading.book) {
      return 0;
    }

    return Number(((lastIncompleteReading.readPages! * 100) / lastIncompleteReading.book.pages!).toFixed(0));
  }, [lastIncompleteReading]);

  const handlePress = useCallback(() => {
    navigation.navigate('Reading', { id: lastIncompleteReading?.id });
  }, [lastIncompleteReading, navigation]);

  return (
    <MainBookCard book={lastIncompleteReading?.book} percentageCompleted={percentageCompleted} onPress={handlePress} />
  );
};

export default LastReadingSection;
