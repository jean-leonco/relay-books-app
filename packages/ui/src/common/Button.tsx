import React from 'react';
import { ActivityIndicator, TouchableOpacityProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled, { css, useTheme } from 'styled-components/native';

import Space from './Space';

import Text from './Text';

type ButtonType = 'primary' | 'text' | 'bordered' | 'gradient';

const radiusStyle = { min: 4, medium: 8, max: 12 };
const radiusCss = { min: 'border-radius: 4px;', medium: 'border-radius: 8px;', max: 'border-radius: 12px;' };

const typeCss = {
  primary: {
    container: css<ContainerProps>`
      height: 50px;
      width: 100%;
      padding: 12px 0;
      background: ${(p) => p.theme.colors.primary};
    `,
    label: css<LabelProps>`
      color: ${(p) => (p.labelColor ? p.theme.colors[p.labelColor] : p.theme.colors.white)};
    `,
  },
  text: {
    container: css<ContainerProps>``,
    label: css<LabelProps>`
      color: ${(p) => (p.labelColor ? p.theme.colors[p.labelColor] : p.theme.colors.primary)};
    `,
  },
  bordered: {
    container: css<ContainerProps>`
      height: 50px;
      width: 100%;
      padding: 12px 0;
      border: ${(p) =>
        p.borderColor ? `1px solid ${p.theme.colors[p.borderColor]}` : `1px solid ${p.theme.colors.primary}`};
    `,
    label: css<LabelProps>`
      color: ${(p) => (p.labelColor ? p.theme.colors[p.labelColor] : p.theme.colors.primary)};
    `,
  },
  gradient: {
    container: css<ContainerProps>`
      height: 50px;
      width: 100%;
      padding: 12px 0;
    `,
    label: css<LabelProps>`
      color: ${(p) => (p.labelColor ? p.theme.colors[p.labelColor] : p.theme.colors.white)};
    `,
  },
};

interface ContainerProps {
  css?: any;
  radius?: 'min' | 'medium' | 'max';
  type: ButtonType;
  borderColor?: string;
}

const Container = styled.TouchableOpacity<ContainerProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${(p) => typeCss[p.type].container};
  ${(p) => (p.radius ? radiusCss[p.radius] : radiusCss.medium)};
  ${(p) => p.disabled && 'opacity: 0.7;'}
  ${(p) => p.css}
`;

interface LabelProps {
  css?: any;
  type: ButtonType;
  labelColor?: string;
}

const Label = styled(Text)<LabelProps>`
  font-size: ${(p) => p.theme.fontSizes.button};
  ${(p) => typeCss[p.type].label};
  ${(p) => p.css}
`;

export interface ButtonProps extends TouchableOpacityProps {
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  loadingColor?: string;
  buttonCss?: any;
  labelCss?: any;
  radius?: 'min' | 'medium' | 'max';
  type?: ButtonType;
  borderColor?: string;
  labelColor?: string;
  tintColor?: string;
}

const Button = ({
  children,
  loadingColor,
  loading,
  disabled,
  icon,
  buttonCss,
  labelCss,
  type = 'primary',
  borderColor,
  labelColor,
  tintColor,
  radius,
  ...props
}: ButtonProps) => {
  const theme = useTheme();

  const button = (
    <Container type={type} disabled={disabled} borderColor={borderColor} css={buttonCss} radius={radius} {...props}>
      {loading ? (
        <ActivityIndicator color={loadingColor || theme.colors.white} />
      ) : (
        <>
          {icon && (
            <>
              {icon}
              <Space width={8} />
            </>
          )}
          <Label type={type} labelColor={labelColor} css={labelCss}>
            {children}
          </Label>
        </>
      )}
    </Container>
  );

  if (type === 'gradient') {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: radius ? radiusStyle[radius] : radiusStyle.medium }}
      >
        {button}
      </LinearGradient>
    );
  }

  return button;
};

export default Button;
