import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

import { Column, Row, Space } from '@workspace/ui';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const HomePresentationSectionShimmer = () => {
  return (
    <Column>
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
  );
};

export default HomePresentationSectionShimmer;
