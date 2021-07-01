import { useCallback, useRef } from 'react';
import { Animated, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import star from '../../assets/star.png';

interface IStar extends Animated.AnimatedComponent<typeof Image> {
  position: number;
  handleRatingChange(rating: number): void;
  fill: boolean;
  size?: number;
  disabled?: boolean;
  index: number;
}

const StarPlaceholder = styled(Animated.Image)<IStar>`
  margin: ${(p) => (p.index === 0 ? `0 3px 0 0` : '0 3px')};
  tint-color: ${(p) => (p.fill ? p.theme.colors.primary : p.theme.colors.c1)};
  width: ${(p) => `${p.size}px`};
  height: ${(p) => `${p.size}px`};
`;

const Star = ({ position, handleRatingChange, size = 20, disabled, ...props }: IStar) => {
  const springValue = useRef(new Animated.Value(1)).current;

  const handleRated = useCallback(() => {
    springValue.setValue(1.2);

    Animated.spring(springValue, {
      toValue: 1,
      friction: 2,
      tension: 1,
      useNativeDriver: true,
    }).start();

    handleRatingChange(position);
  }, [handleRatingChange, position, springValue]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleRated} disabled={disabled}>
      <StarPlaceholder source={star} size={size} style={{ transform: [{ scale: springValue }] }} {...props} />
    </TouchableOpacity>
  );
};

export default Star;
