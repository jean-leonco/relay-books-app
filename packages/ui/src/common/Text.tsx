import React from 'react';
import { TextProps as RNTextProps } from 'react-native';
import styled from 'styled-components/native';

const Container = styled.Text<TextProps>`
  color: ${(p) => (p.color ? p.theme.colors[p.color] || p.color : p.theme.colors.black)};
  font-size: ${(p) => (p.size ? p.theme.fontSizes[p.size] || p.size : p.theme.fontSizes.text)};
  font-weight: ${(p) => (p.weight ? p.theme.fontWeights[p.weight] || p.weight : p.theme.fontWeights.regular)};
  ${(p) => p.height && `line-height: ${p.height}px;`}
  ${(p) => p.center && 'text-align: center;'}
  ${(p) => p.italic && ' font-style: italic;'}
  ${(p) => p.css}
`;

interface TextProps extends RNTextProps {
  color?: string;
  size?: string;
  height?: number;
  weight?: string;
  children: React.ReactNode;
  css?: any;
  center?: boolean;
  italic?: boolean;
}

const Text = ({ children, ...props }: TextProps) => {
  return <Container {...props}>{children}</Container>;
};

export default Text;
