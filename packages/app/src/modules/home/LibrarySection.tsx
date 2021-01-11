import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';

import { BookCard } from '@workspace/ui';

import useKeyExtractor from '../common/useKeyExtractor';

import { LibrarySection_query$key } from './__generated__/LibrarySection_query.graphql';

interface LibrarySectionProps {
  readings: LibrarySection_query$key;
}

const LibrarySection = (props: LibrarySectionProps) => {
  const data = useFragment<LibrarySection_query$key>(
    graphql`
      fragment LibrarySection_query on Query {
        readings(first: 10) @connection(key: "LibrarySection_readings", filters: []) {
          edges {
            node {
              id
              book {
                id
                ...BookCard_book
              }
            }
          }
        }
      }
    `,
    props.readings,
  );

  const renderCard = useCallback(({ index, item }) => <BookCard index={index} query={item?.node.book} />, []);
  const keyExtractor = useKeyExtractor();

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.readings.edges}
      keyExtractor={keyExtractor}
      renderItem={renderCard}
    />
  );
};

export default LibrarySection;
