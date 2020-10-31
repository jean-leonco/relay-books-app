import React from 'react';
import { ScrollView, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { css } from 'styled-components/native';

import { Column, Row, Space } from '@booksapp/ui';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const containerCss = css`
  padding: 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const spacingStyle = { marginLeft: 16 };

const spacingCss = css`
  padding: 0 16px;
`;

const data = new Array(20);

interface IShimmerList {
  showName?: boolean;
  bannerSize?: { width: number; height: number };
  containerWidth?: number;
}

const ShimmerList = ({
  showName = true,
  containerWidth = 120,
  bannerSize = { width: 110, height: 160 },
}: IShimmerList) => (
  <FlatList
    showsHorizontalScrollIndicator={false}
    horizontal
    style={{ paddingVertical: 10 }}
    data={data}
    keyExtractor={(item, index) => String(index)}
    renderItem={({ index }) => (
      <Column style={{ width: containerWidth, marginLeft: index === 0 ? 12 : 0 }}>
        <ShimmerPlaceHolder width={bannerSize.width} height={bannerSize.height} style={{ borderRadius: 8 }} />
        {showName && (
          <>
            <Space height={10} />
            <ShimmerPlaceHolder width={90} height={14} />
          </>
        )}
      </Column>
    )}
  />
);

const HomeShimmer = () => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Column flex={1} css={containerCss}>
        <Column css={spacingCss}>
          <ShimmerPlaceHolder width={95} height={18} />
          <Space height={10} />
          <ShimmerPlaceHolder width={224} height={28} />
          <Space height={30} />

          <Row align="flex-end">
            <Column span={11}>
              <ShimmerPlaceHolder width={160} height={240} style={{ borderRadius: 8 }} />
            </Column>
            <Space width={13} />
            <Column span={8}>
              <ShimmerPlaceHolder width={140} height={18} />
              <Space height={4} />
              <ShimmerPlaceHolder width={120} height={16} />
              <Space height={4} />
            </Column>
          </Row>
        </Column>
        <Space height={60} />

        <Row align="center" justify="space-between" css={spacingCss}>
          <ShimmerPlaceHolder width={120} height={18} />
          <ShimmerPlaceHolder width={95} height={18} />
        </Row>
        <Space height={10} />
        <ShimmerList />
        <Space height={30} />

        <ShimmerPlaceHolder width={120} height={18} style={spacingStyle} />
        <Space height={10} />
        <ShimmerList />
        <Space height={30} />

        <ShimmerPlaceHolder width={120} height={18} style={spacingStyle} />
        <Space height={10} />
        <ShimmerList showName={false} containerWidth={190} bannerSize={{ width: 180, height: 250 }} />
        {/* <TrendingSection trending={data} /> */}
        <Space height={30} />

        <ShimmerPlaceHolder width={120} height={18} style={spacingStyle} />
        <Space height={10} />
        <ShimmerList />
      </Column>
    </ScrollView>
  );
};

export default HomeShimmer;
