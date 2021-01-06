import React from 'react';
import { FlatList, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { css } from 'styled-components';

import { Column, Row, Space } from '@workspace/ui';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const dimensions = Dimensions.get('window');

const containerCss = css`
  padding: 24px 8px 0;
  background: ${(p) => p.theme.colors.background};
`;

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const SearchShimmer = () => {
  return (
    <Column flex={1} css={containerCss}>
      <Column style={{ height: 70 }}>
        <ShimmerPlaceHolder width={dimensions.width - 32} height={40} style={{ borderRadius: 6 }} />
        <Space height={10} />
        <ShimmerPlaceHolder width={110} height={16} />
      </Column>
      <Space height={4} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        keyExtractor={(item, index) => String(index)}
        renderItem={() => (
          <Row align="center" style={{ marginVertical: 10 }}>
            <ShimmerPlaceHolder width={90} height={110} style={{ borderRadius: 8 }} />
            <Space width={12} />
            <Column>
              <ShimmerPlaceHolder width={160} height={20} />
              <Space height={4} />
              <ShimmerPlaceHolder width={100} height={16} />
              <Space height={12} />
              <ShimmerPlaceHolder width={140} height={14} />
              <Space height={4} />
              <ShimmerPlaceHolder width={110} height={16} />
              <Space height={4} />
            </Column>
          </Row>
        )}
      />
      <Space height={4} />
    </Column>
  );
};

export default SearchShimmer;
