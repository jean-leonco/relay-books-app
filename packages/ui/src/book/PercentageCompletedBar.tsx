import React from 'react';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled from 'styled-components/native';

import Row from '../common/Row';
import Space from '../common/Space';
import Text from '../common/Text';

const CompletedTrack = styled.View<{ width?: string }>`
  height: 5px;
  border-radius: 5px;
  position: relative;
  width: ${(p) => p.width || '100%'};
  background: ${(p) => p.theme.colors.c1};
`;

const CompletedBar = styled.View<{ completed: number }>`
  height: 5px;
  border-radius: 5px;
  position: absolute;
  width: ${(p) => `${p.completed}%`};
  background: ${(p) => p.theme.colors.primary};
`;

interface PercentageCompletedBarProps {
  containerCss?: FlattenSimpleInterpolation;
  percentageCompleted: number;
  width?: string;
  showLabel?: boolean;
}

const PercentageCompletedBar = ({
  containerCss,
  percentageCompleted,
  width,
  showLabel = true,
}: PercentageCompletedBarProps) => {
  return (
    <Row align="center" css={containerCss}>
      <CompletedTrack width={width}>
        <CompletedBar completed={percentageCompleted} />
      </CompletedTrack>
      {showLabel && (
        <>
          <Space width={10} />
          <Text color="c3">{percentageCompleted}%</Text>
        </>
      )}
    </Row>
  );
};

export default PercentageCompletedBar;
