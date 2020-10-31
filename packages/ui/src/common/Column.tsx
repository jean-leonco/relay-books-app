import React from 'react';
import { Animated, ViewProps } from 'react-native';
import styled, { css } from 'styled-components/native';

const commonCss = css<ColumnProps>`
  flex-direction: column;
  ${(p) => p.justify && `justify-content: ${p.justify};`}
  ${(p) => p.align && `align-items: ${p.align};`}
  ${(p) => p.flex && `flex: ${p.flex};`}
  ${(p) => p.css}
  ${(p) =>
    p.span &&
    css`
      width: ${(p.span * 100) / 24}%;
    `}
`;

const Container = styled.View<ColumnProps>`
  ${commonCss}
`;

const AnimatedContainer = styled(Animated.View)`
  ${commonCss}
`;

interface ColumnProps extends ViewProps {
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flex?: number;
  span?: number;
  children?: React.ReactNode;
  css?: any;
  animated?: boolean;
}

const Column = ({ children, animated, ...props }: ColumnProps) => {
  return animated ? (
    <AnimatedContainer {...props}>{children}</AnimatedContainer>
  ) : (
    <Container {...props}>{children}</Container>
  );
};

export default Column;
