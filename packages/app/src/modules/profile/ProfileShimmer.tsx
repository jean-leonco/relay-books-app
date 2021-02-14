import React from 'react';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { css } from 'styled-components/native';

import { Column, Space } from '@workspace/ui';

const containerCss = css`
  padding: 24px 16px;
  background: ${(p) => p.theme.colors.background};
`;

const { width } = Dimensions.get('window');

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const ProfileShimmer = () => {
  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <ShimmerPlaceHolder width={110} height={18} />
      <Space height={30} />
      <ShimmerPlaceHolder width={184} height={48} />
      <Space height={60} />
      <Column align="flex-start" style={{ width: '100%' }}>
        <ShimmerPlaceHolder width={width - 32} height={50} />
        <Space height={20} />
        <ShimmerPlaceHolder width={width - 32} height={50} />
      </Column>
    </Column>
  );
};

export default ProfileShimmer;
