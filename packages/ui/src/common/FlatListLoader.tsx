import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components';

import Column from './Column';

interface FlatListLoaderProps {
  size?: number;
  height?: number;
  marginHorizontal?: number;
}

const FlatListLoader = ({ size = 28, height = 160, marginHorizontal = 24 }: FlatListLoaderProps) => {
  const theme = useTheme();

  return (
    <Column align="center" justify="center" style={{ height, marginHorizontal }}>
      <ActivityIndicator color={theme.colors.primary} size={size} />
    </Column>
  );
};

export default FlatListLoader;
