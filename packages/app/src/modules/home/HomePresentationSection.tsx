import React, { useEffect, useMemo } from 'react';
import { graphql, useRefetchableFragment } from 'react-relay';

import { useTransition } from '@workspace/relay';
import { Column, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import { HomePresentationSection_query$key } from './__generated__/HomePresentationSection_query.graphql';
import { HomePresentationSectionRefetchQuery } from './__generated__/HomePresentationSectionRefetchQuery.graphql';

import HomePresentationSectionShimmer from './HomePresentationSectionShimmer';
import LastReadingSection from './LastReadingSection';
import TodaysSuggestion from './TodaysSuggestion';

interface HomePresentationSectionProps {
  query: HomePresentationSection_query$key;
}

const HomePresentationSection = (props: HomePresentationSectionProps) => {
  const { t } = useTranslation();

  const [startTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment<
    HomePresentationSectionRefetchQuery,
    HomePresentationSection_query$key
  >(
    graphql`
      fragment HomePresentationSection_query on Query
      @argumentDefinitions(
        hasReading: { type: Boolean, defaultValue: false }
        includeSuggestion: { type: Boolean, defaultValue: false }
      )
      @refetchable(queryName: "HomePresentationSectionRefetchQuery") {
        me {
          lastIncompleteReading {
            __typename
          }
          ...LastReadingSection_user @include(if: $hasReading)
        }
        ...TodaysSuggestion_query @include(if: $includeSuggestion)
      }
    `,
    props.query,
  );

  const hasLastIncompleteReading = useMemo(() => !!data.me?.lastIncompleteReading, [data.me?.lastIncompleteReading]);

  const hasLastReadingSectionFragment = useMemo(
    () => (data.me ? !!data.me['__fragments']?.LastReadingSection_user : false),
    [data.me],
  );
  const hasTodaysSuggestionFragment = useMemo(() => !!data['__fragments']?.TodaysSuggestion_query, [data]);

  useEffect(() => {
    if (hasLastIncompleteReading) {
      startTransition(() => {
        refetch({ hasReading: true });
      });
    } else {
      startTransition(() => {
        refetch({ includeSuggestion: true });
      });
    }
  }, [hasLastIncompleteReading, refetch]);

  // Just to be sure at least one of the fragments will be available
  if (!hasLastReadingSectionFragment && !hasTodaysSuggestionFragment) {
    return <HomePresentationSectionShimmer />;
  }

  return (
    <Column>
      <Text size="title" weight="bold">
        {hasLastIncompleteReading ? t('continue_reading') : t('todays_suggestion')}
      </Text>
      <Space height={30} />

      {hasLastReadingSectionFragment ? (
        <LastReadingSection lastReading={data.me!} />
      ) : (
        hasTodaysSuggestionFragment && <TodaysSuggestion suggestion={data} />
      )}
    </Column>
  );
};

export default HomePresentationSection;
