import React, { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay/hooks';

import MainBookCard from './MainBookCard';
import { LastReadingSection_query$key } from './__generated__/LastReadingSection_query.graphql';

interface LastReadingSectionProps {
  lastReading: LastReadingSection_query$key;
}

const LastReadingSection = (props: LastReadingSectionProps) => {
  const data = useFragment<LastReadingSection_query$key>(
    graphql`
      fragment LastReadingSection_query on Query {
        lastReading: readings(first: 1, filters: { finished: false })
          @connection(key: "LastReadingSection_lastReading", filters: []) {
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
              readPages
              book {
                pages
                ...MainBookCard_book
              }
            }
          }
        }
      }
    `,
    props.lastReading,
  );

  const percentageCompleted = useMemo(() => {
    const lastReading = data?.lastReading?.edges[0] ? data.lastReading.edges[0] : null;

    if (!lastReading || !lastReading.node.book) {
      return 0;
    }

    return Number(((lastReading.node.readPages! * 100) / lastReading.node.book.pages!).toFixed(0));
  }, [data.lastReading]);

  return <MainBookCard book={data.lastReading.edges[0]?.node.book} percentageCompleted={percentageCompleted} />;
};

export default LastReadingSection;
