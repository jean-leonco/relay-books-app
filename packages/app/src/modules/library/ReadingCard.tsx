import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';

import { Column, PercentageCompletedBar, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import { ReadingCard_reading$key } from './__generated__/ReadingCard_reading.graphql';

const containerCss = css`
  margin: 10px 0;
`;

const Banner = styled.Image`
  background: ${(p) => p.theme.colors.c2};
  width: 90px;
  height: 110px;
  border-radius: 8px;
`;

interface ReadingCardProps {
  query: ReadingCard_reading$key;
  index: number;
}

const ReadingCard = (props: ReadingCardProps) => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const data = useFragment<ReadingCard_reading$key>(
    graphql`
      fragment ReadingCard_reading on Reading {
        id
        readPages
        book {
          pages
          name
          author
          bannerUrl
        }
      }
    `,
    props.query,
  );

  const percentageCompleted = useMemo(() => {
    const percentage = ((data.readPages * 100) / data.book.pages).toFixed(0);
    return Number(percentage);
  }, [data]);

  const handlePress = useCallback(() => {
    navigation.navigate('Reading', { id: data.id });
  }, [data.id, navigation]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Row align="flex-end" css={containerCss}>
        <Banner source={{ uri: data.book?.bannerUrl }} />
        <Space width={12} />
        <Column span={17}>
          <Text size="button" weight="bold">
            {data.book?.name}
          </Text>
          <Space height={4} />
          <Text size="label" color="c3">
            {data.book?.author}
          </Text>
          <Space height={12} />
          <Row align="center" justify="flex-end">
            <Text size="12px" color="c3">
              {t('read_pages_of_pages', { readPages: data.readPages, pages: data.book?.pages })}
            </Text>
          </Row>
          <Space height={8} />
          <PercentageCompletedBar percentageCompleted={percentageCompleted} showLabel={false} />
          <Space height={4} />
        </Column>
      </Row>
    </TouchableOpacity>
  );
};

export default ReadingCard;
