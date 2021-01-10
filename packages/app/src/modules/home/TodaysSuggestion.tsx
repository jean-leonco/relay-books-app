import React, { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay/hooks';
import { useNavigation } from '@react-navigation/native';

import MainBookCard from './MainBookCard';
import { TodaysSuggestion_query$key } from './__generated__/TodaysSuggestion_query.graphql';

interface TodaysSuggestionProps {
  suggestion: TodaysSuggestion_query$key;
}

const TodaysSuggestion = (props: TodaysSuggestionProps) => {
  const navigation = useNavigation();

  const data = useFragment<TodaysSuggestion_query$key>(
    graphql`
      fragment TodaysSuggestion_query on Query {
        suggestion: books(first: 1, filters: { trending: true }) {
          edges {
            node {
              id
              ...MainBookCard_book
            }
          }
        }
      }
    `,
    props.suggestion,
  );

  const handlePress = useCallback(() => {
    navigation.navigate('Book', { id: data.suggestion.edges[0]?.node?.id });
  }, [data.suggestion.edges, navigation]);

  return <MainBookCard book={data.suggestion.edges[0]?.node} onPress={handlePress} />;
};

export default TodaysSuggestion;
