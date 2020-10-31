import React from 'react';
import { graphql, useFragment } from 'react-relay/hooks';

import MainBookCard from './MainBookCard';
import { TodaysSuggestion_query$key } from './__generated__/TodaysSuggestion_query.graphql';

interface TodaysSuggestionProps {
  suggestion: TodaysSuggestion_query$key;
}

const TodaysSuggestion = (props: TodaysSuggestionProps) => {
  const data = useFragment<TodaysSuggestion_query$key>(
    graphql`
      fragment TodaysSuggestion_query on Query {
        suggestion: books(first: 1, filters: { trending: true })
          @connection(key: "TodaysSuggestion_suggestion", filters: []) {
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

  return <MainBookCard book={data.suggestion.edges[0]?.node} />;
};

export default TodaysSuggestion;
