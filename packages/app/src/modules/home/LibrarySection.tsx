import React from 'react';
import { FlatList } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';

import { BookCard } from '@booksapp/ui';

import { LibrarySection_query$key } from './__generated__/LibrarySection_query.graphql';

interface LibrarySectionProps {
  readings: LibrarySection_query$key;
}

const LibrarySection = (props: LibrarySectionProps) => {
  const data = useFragment<LibrarySection_query$key>(
    graphql`
      fragment LibrarySection_query on Query {
        readings(first: 10) @connection(key: "LibrarySection_readings", filters: []) {
          count
          totalCount
          endCursorOffset
          startCursorOffset
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            cursor
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

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.readings.edges}
      keyExtractor={(item) => item.node.id}
      renderItem={({ item, index }) => <BookCard index={index} book={item?.node.book} />}
    />
  );
};

export default LibrarySection;
