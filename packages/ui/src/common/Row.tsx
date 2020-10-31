import React from 'react';
import { ViewProps, Animated } from 'react-native';
import styled, { css } from 'styled-components/native';

const commonCss = css<RowProps>`
  flex-direction: row;
  ${(p) => p.justify && `justify-content: ${p.justify};`}
  ${(p) => p.align && `align-items: ${p.align};`}
  ${(p) => p.flex && `flex: ${p.flex};`}
  ${(p) => p.flexWrap && `flex-wrap: ${p.flexWrap};`}
  ${(p) => p.css}
`;

const Container = styled.View<RowProps>`
  ${commonCss}
`;

const AnimatedContainer = styled(Animated.View)`
  ${commonCss}
`;

interface RowProps extends ViewProps {
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'no-wrap' | 'wrap' | 'wrap-reverse';
  flex?: string | number;
  children?: React.ReactNode;
  css?: any;
  animated?: boolean;
}

const Row = ({ children, animated, ...props }: RowProps) => {
  return animated ? (
    <AnimatedContainer {...props}>{children}</AnimatedContainer>
  ) : (
    <Container {...props}>{children}</Container>
  );
};

export default Row;
