import { useNavigation } from '@react-navigation/native';
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { graphql, useFragment } from 'react-relay';
import { css, useTheme } from 'styled-components/native';

import { Row } from '@workspace/ui';

import { BookHeader_book$key } from './__generated__/BookHeader_book.graphql';

const AnimatedText = Animated.createAnimatedComponent(Text);

const headerCss = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px 24px 12px;
  z-index: 20;
`;

interface BookHeaderProps {
  setBottomSheetOpen(bool: boolean): void;
  scrollY: Animated.Value;
  query: BookHeader_book$key;
}

const BookHeader = ({ setBottomSheetOpen, scrollY, ...props }: BookHeaderProps) => {
  const navigation = useNavigation();

  const theme = useTheme();

  const data = useFragment<BookHeader_book$key>(
    graphql`
      fragment BookHeader_book on Book {
        name
      }
    `,
    props.query,
  );

  const color = useRef(
    scrollY.interpolate({
      inputRange: [300, 400],
      outputRange: ['rgba(255,255,255,0)', theme.colors.background],
      extrapolate: 'clamp',
    }),
  ).current;

  const opacity = useRef(
    scrollY.interpolate({
      inputRange: [350, 400],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
  ).current;

  return (
    <Row animated style={{ backgroundColor: color }} align="center" justify="space-between" css={headerCss}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="ios-chevron-back-outline" size={24} color={theme.colors.black} />
      </TouchableOpacity>
      <AnimatedText style={{ fontSize: 18, opacity, fontWeight: 'bold' }}>{data.name}</AnimatedText>
      <TouchableOpacity onPress={() => setBottomSheetOpen(true)}>
        <Ionicons name="ellipsis-vertical-outline" size={24} color={theme.colors.black} />
      </TouchableOpacity>
    </Row>
  );
};

export default BookHeader;
