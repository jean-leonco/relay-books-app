import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { css, useTheme } from 'styled-components/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

const containerCss = css`
  padding: 40px 24px 0;
  background: ${(p) => p.theme.colors.background};
`;

const titleCss = css`
  margin-bottom: 20px;
`;

const buttonCss = css`
  width: 100%;
  padding: 8px 0;
`;

const Language = () => {
  const { t, i18n } = useTranslation();

  const theme = useTheme();

  const languages = useMemo(
    () => [
      {
        label: 'English',
        value: 'en',
      },
      {
        label: 'Português',
        value: 'pt',
      },
    ],
    [],
  );

  const renderCard = useCallback<ListRenderItem<typeof languages[0]>>(
    ({ item }) => (
      <Row align="center" touchable onPress={() => i18n.changeLanguage(item.value)} css={buttonCss}>
        <Text size="button">{item.label}</Text>
        <Space width={8} />
        {i18n.language.includes(item.value) && (
          <Ionicons name="checkmark-sharp" size={20} color={theme.colors.accent} />
        )}
      </Row>
    ),
    [i18n, theme.colors.accent],
  );

  return (
    <Column flex={1} css={containerCss}>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text size="title" weight="bold" css={titleCss}>
            {t('available_languages')}
          </Text>
        }
        data={languages}
        keyExtractor={(item) => item.label}
        renderItem={renderCard}
      />
    </Column>
  );
};

export default Language;
