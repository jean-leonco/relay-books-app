import { useNavigation } from '@react-navigation/core';
import { ReactNode, useMemo } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { css, useTheme } from 'styled-components';

import Row from './Row';

const headerCss = css`
  background: ${(p) => p.theme.colors.background};
  width: 100%;
`;

type HeaderProps = {
  children?: ReactNode;
  containerCss?: any;
  goBackProps?: TouchableOpacityProps;
};

const Header = ({ children, containerCss, goBackProps }: HeaderProps) => {
  const navigation = useNavigation();

  const rowCss = useMemo(
    () =>
      css`
        ${headerCss}
        ${containerCss}
      `,
    [containerCss],
  );

  const theme = useTheme();
  return (
    <Row align="center" justify="space-between" css={rowCss}>
      <TouchableOpacity onPress={() => navigation.goBack()} {...goBackProps}>
        <Ionicons name="ios-chevron-back-outline" size={24} color={theme.colors.black} />
      </TouchableOpacity>
      {children}
    </Row>
  );
};

export default Header;
