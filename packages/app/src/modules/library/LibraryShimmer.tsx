import React, { useMemo } from 'react';
import { Dimensions, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { css } from 'styled-components/native';

import { Column, Row, Space } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const containerCss = css`
  padding: 24px 0 0;
  background: ${(p) => p.theme.colors.background};
`;

const spacingStyle = { marginLeft: 16 };

const data = new Array(20);

const dimensions = Dimensions.get('window');

interface IShimmerList {
  showName?: boolean;
  bannerSize?: { width: number; height: number };
  containerWidth?: number;
}

const ReadItAgain = ({ containerWidth = 120, bannerSize = { width: 110, height: 160 } }: IShimmerList) => (
  <FlatList
    showsHorizontalScrollIndicator={false}
    horizontal
    style={{ paddingVertical: 10 }}
    data={data}
    keyExtractor={(_item, index) => String(index)}
    renderItem={({ index }) => (
      <Column style={{ width: containerWidth, marginLeft: index === 0 ? 12 : 0 }}>
        <ShimmerPlaceHolder width={bannerSize.width} height={bannerSize.height} style={{ borderRadius: 8 }} />
        <Space height={10} />
        <ShimmerPlaceHolder width={90} height={14} />
      </Column>
    )}
  />
);

const ContinueReading = () => (
  <FlatList
    showsVerticalScrollIndicator={false}
    style={{ paddingHorizontal: 16 }}
    data={data}
    keyExtractor={(_item, index) => String(index)}
    renderItem={() => (
      <Row align="flex-end" style={{ marginVertical: 10 }}>
        <ShimmerPlaceHolder width={90} height={110} style={{ borderRadius: 8 }} />
        <Space width={12} />
        <Column>
          <ShimmerPlaceHolder width={160} height={20} />
          <Space height={4} />
          <ShimmerPlaceHolder width={100} height={16} />
          <Space height={20} />
          <ShimmerPlaceHolder width={dimensions.width - 140} height={10} style={{ borderRadius: 10 }} />
          <Space height={4} />
        </Column>
      </Row>
    )}
  />
);

const LibraryShimmer = () => {
  const { t } = useTranslation();

  const list = useMemo(
    () => [
      { title: t('read_it_again'), render: () => <ReadItAgain /> },
      { title: t('continue_reading'), render: () => <ContinueReading /> },
    ],
    [t],
  );

  return (
    <Column flex={1} css={containerCss}>
      <FlatList
        ListHeaderComponent={
          <>
            <ShimmerPlaceHolder width={224} height={28} style={spacingStyle} />
            <Space height={30} />
          </>
        }
        showsVerticalScrollIndicator={false}
        data={list}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <>
            <ShimmerPlaceHolder width={120} height={18} style={spacingStyle} />
            <Space height={10} />
            {item.render()}
            <Space height={20} />
          </>
        )}
      />
    </Column>
  );
};

export default LibraryShimmer;
