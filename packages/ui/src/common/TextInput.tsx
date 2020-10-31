import React from 'react';
import { TextInputProps as ReactTextInputProps } from 'react-native';
import styled, { css, useTheme } from 'styled-components/native';

import Row from './Row';
import Column from './Column';
import Space from './Space';
import Text from './Text';

const wrapperCss = css``;

const containerCss = css`
  width: 100%;
  border-radius: 6px;
  border: ${(p) => `1px solid ${p.theme.colors.c2}`};
`;

const Input = styled.TextInput<TextInputProps & { hasIcon: boolean }>`
  flex: 1;
  padding: ${(p) => (p.hasIcon ? '4px 16px 4px 8px' : '4px 16px')};
  border: none;
  color: ${(p) => p.theme.colors.black};
  font-size: ${(p) => p.theme.fontSizes.label};
  ${(p) => p.height && `height: 40px;`}
  ${(p) => p.css}
`;

const Label = styled(Text)`
  color: ${(p) => p.theme.colors.black};
  font-size: ${(p) => p.theme.fontSizes.label};
  font-weight: ${(p) => p.theme.fontWeights.semiBold};
`;

const Error = styled(Text)`
  color: #ef3d52;
  font-size: 13px;
`;

export interface TextInputProps extends ReactTextInputProps {
  css?: any;
  icon?: React.ReactNode;
  label?: string;
  error?: string;
  height?: number;
  showErrorContainer?: boolean;
}

const TextInput = ({ label, icon, error, height = 40, showErrorContainer = true, ...props }: TextInputProps) => {
  const theme = useTheme();

  return (
    <Column css={wrapperCss}>
      {label && (
        <>
          <Label>{label}</Label>
          <Space height={14} />
        </>
      )}
      <Row align="center" css={containerCss}>
        {icon && (
          <>
            <Space width={8} />
            {icon}
          </>
        )}
        <Input placeholderTextColor={theme.colors.c3} hasIcon={!!icon} height={height} {...props} />
      </Row>
      {showErrorContainer && (
        <>
          <Space height={4} />
          <Error>{error}</Error>
        </>
      )}
    </Column>
  );
};

export default TextInput;
