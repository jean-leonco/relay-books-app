import React from 'react';
import { ViewProps, Animated, TouchableOpacityProps } from 'react-native';
import styled, { css } from 'styled-components/native';

const commonCss = css<FlexProps>`
  flex-direction: ${(p) => p.direction};
  ${(p) => p.justify && `justify-content: ${p.justify};`}
  ${(p) => p.align && `align-items: ${p.align};`}
  ${(p) => p.flex && `flex: ${p.flex};`}
  ${(p) => p.flexWrap && `flex-wrap: ${p.flexWrap};`}
  ${(p) => p.css}
`;

const Container = styled.View<FlexProps>`
  ${commonCss}
`;

const AnimatedContainer = styled(Animated.View)`
  ${commonCss}
`;

const TouchableContainer = styled.TouchableOpacity<FlexProps>`
  ${commonCss}
`;

interface FlexProps extends ViewProps, TouchableOpacityProps {
  direction?: 'column' | 'row';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'no-wrap' | 'wrap' | 'wrap-reverse';
  flex?: string | number;
  children?: React.ReactNode;
  css?: any;
  animated?: boolean;
  touchable?: boolean;
}

export type OmittedDirectionFlexProps = Omit<FlexProps, 'direction'>;

const Flex = ({ direction = 'column', children, animated, touchable, ...props }: FlexProps) => {
  if (touchable) {
    return (
      <TouchableContainer direction={direction} {...props}>
        {children}
      </TouchableContainer>
    );
  }

  if (animated) {
    return (
      <AnimatedContainer direction={direction} {...props}>
        {children}
      </AnimatedContainer>
    );
  }

  return (
    <Container direction={direction} {...props}>
      {children}
    </Container>
  );
};

export default Flex;
