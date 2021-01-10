import React, { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';

import { BookCard } from '@workspace/ui';

import { LibrarySection_query$key } from './__generated__/LibrarySection_query.graphql';

interface LibrarySectionProps {
  readings: LibrarySection_query$key;
}

const LibrarySection = (props: LibrarySectionProps) => {
  const data = useFragment<LibrarySection_query$key>(
    graphql`
      fragment LibrarySection_query on Query {
        readings(first: 10) {
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

  const renderCard = useCallback<ListRenderItem<typeof data.readings.edges[0]>>(
    ({ index, item }) => <BookCard index={index} query={item?.node.book} />,
    [],
  );

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingVertical: 10 }}
      data={data.readings.edges}
      keyExtractor={(item) => item.node.id}
      renderItem={renderCard}
    />
  );
};

export default LibrarySection;
