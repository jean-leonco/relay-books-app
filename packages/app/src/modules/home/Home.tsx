import React, { Suspense } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay/hooks';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import HomePresentationSection from './HomePresentationSection';
import HomePresentationSectionShimmer from './HomePresentationSectionShimmer';
import LibrarySection from './LibrarySection';
import ReleasesSection from './ReleasesSection';
import TrendingSection from './TrendingSection';

import { HomeQuery } from './__generated__/HomeQuery.graphql';

const containerCss = css`
  padding: 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const spacingCss = css`
  padding: 0 16px;
`;

const Home = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const data = useLazyLoadQuery<HomeQuery>(
    graphql`
      query HomeQuery {
        me {
          name
          hasReading
        }
        ...HomePresentationSection_query
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
            {t('hello_name', { name: data.me?.name })}
          </Text>
          <Space height={10} />
          <Suspense fallback={<HomePresentationSectionShimmer />}>
            <HomePresentationSection query={data} />
          </Suspense>
        </Column>
        <Space height={60} />

        {data.me?.hasReading && (
          <>
            <Row align="center" justify="space-between" css={spacingCss}>
              <Text size="button">{t('my_library')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Library')}>
                <Text size="label" color="primary">
                  {t('see_all')}
                </Text>
              </TouchableOpacity>
            </Row>
            <Space height={10} />
            <LibrarySection readings={data} />
            <Space height={30} />
          </>
        )}

        <Text size="button" css={spacingCss}>
          {t('releases')}
        </Text>
        <Space height={10} />
        <ReleasesSection releases={data} />
        <Space height={30} />

        <Text size="button" css={spacingCss}>
          {t('top__last__days')}
        </Text>
        <Space height={10} />
        <TrendingSection trending={data} />
      </Column>
    </ScrollView>
  );
};

export default Home;
