import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import LastReadingSection from './LastReadingSection';
import LibrarySection from './LibrarySection';
import ReleasesSection from './ReleasesSection';
import TrendingSection from './TrendingSection';
import TodaysSuggestion from './TodaysSuggestion';

import { HomeQuery } from './__generated__/HomeQuery.graphql';

const containerCss = css`
  padding: 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const spacingCss = css`
  padding: 0 16px;
`;

const Home = () => {
  const navigation = useNavigation();

  const data = useLazyLoadQuery<HomeQuery>(
    graphql`
      query HomeQuery {
        me {
          name
        }
        readings(first: 10) {
          count
        }
        ...LastReadingSection_query
        ...TodaysSuggestion_query
        ...LibrarySection_query
        ...ReleasesSection_query
        ...TrendingSection_query
      }
    `,
    {},
  );

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Column flex={1} css={containerCss}>
        <Column css={spacingCss}>
          <Text size="button" color="c3">
            Hello, {data.me?.name}!
          </Text>
          <Space height={10} />
          <Text size="title" weight="bold">
            {data.readings?.count ? 'Continue Reading' : "Today's suggestion"}
          </Text>
          <Space height={30} />
          {/* @TODO - just query today's suggestion if there is not readings */}
          {data.readings?.count ? <LastReadingSection lastReading={data} /> : <TodaysSuggestion suggestion={data} />}
        </Column>
        <Space height={60} />

        {!!data.readings?.count && (
          <>
            <Row align="center" justify="space-between" css={spacingCss}>
              <Text size="button">My Library</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Library')}>
                <Text size="label" color="primary">
                  See all
                </Text>
              </TouchableOpacity>
            </Row>
            <Space height={10} />
            <LibrarySection readings={data} />
            <Space height={30} />
          </>
        )}

        <Text size="button" css={spacingCss}>
          Releases
        </Text>
        <Space height={10} />
        <ReleasesSection releases={data} />
        <Space height={30} />

        <Text size="button" css={spacingCss}>
          Top 10 Last 7 Days
        </Text>
        <Space height={10} />
        <TrendingSection trending={data} />
      </Column>
    </ScrollView>
  );
};

export default Home;
