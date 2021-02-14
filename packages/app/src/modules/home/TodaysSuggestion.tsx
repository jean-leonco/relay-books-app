import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay/hooks';

import { TodaysSuggestion_query$key } from './__generated__/TodaysSuggestion_query.graphql';

import MainBookCard from './MainBookCard';

interface TodaysSuggestionProps {
  suggestion: TodaysSuggestion_query$key;
}

const TodaysSuggestion = (props: TodaysSuggestionProps) => {
  const navigation = useNavigation();

  const { todaySuggestion } = useFragment<TodaysSuggestion_query$key>(
    graphql`
      fragment TodaysSuggestion_query on Query {
        todaySuggestion {
          id
          ...MainBookCard_book
        }
      }
    `,
    props.suggestion,
  );

  const handlePress = useCallback(() => {
    navigation.navigate('Book', { id: todaySuggestion?.id });
  }, [todaySuggestion, navigation]);

  if (!todaySuggestion) {
    return null;
  }

  return <MainBookCard book={todaySuggestion} onPress={handlePress} />;
};

export default TodaysSuggestion;
