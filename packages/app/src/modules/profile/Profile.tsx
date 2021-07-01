import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useTheme } from 'styled-components';
import styled, { css } from 'styled-components/native';

import { Column, Row, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';
import useRouterAuth from '../../router/useRouterAuth';

import { ProfileQuery } from './__generated__/ProfileQuery.graphql';

const containerCss = css`
  padding: 24px 16px;
  background: ${(p) => p.theme.colors.background};
`;

const Separator = styled.View`
  background: ${(p) => p.theme.colors.c2};
  width: 1px;
  height: 70%;
  border-radius: 8px;
  margin: 0 20px;
`;

const maxWidthCss = css`
  width: 100%;
`;

const optionCss = css`
  padding: 6px 8px;
  margin: 6px 0;
  ${maxWidthCss}
`;

const Profile = () => {
  const { t } = useTranslation();

  const navigation = useNavigation();

  const { signOut } = useRouterAuth();

  const theme = useTheme();

  const data = useLazyLoadQuery<ProfileQuery>(
    graphql`
      query ProfileQuery {
        me {
          fullName
          reviews(first: 1) {
            count
          }
        }
        readings(first: 1, filters: { finished: true }) {
          count
        }
      }
    `,
    {},
  );

  const menuOptions = useMemo(
    () => [
      {
        label: t('my_reviews'),
        onPress: () => navigation.navigate('ReviewList'),
      },
      {
        label: t('edit_profile'),
        onPress: () => navigation.navigate('EditProfile'),
      },
      {
        label: t('language'),
        onPress: () => navigation.navigate('Language'),
      },
      {
        label: t('log_out'),
        onPress: signOut,
      },
    ],
    [navigation, signOut, t],
  );

  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <Text size="title" weight="bold" center>
        {data.me?.fullName}
      </Text>
      <Space height={30} />
      <Row align="center" justify="center">
        <Column align="center" justify="center">
          <Text size="h3" weight="bold">
            {data.me?.reviews.count}
          </Text>
          <Text size="label" color="c3">
            {t('reviews')}
          </Text>
        </Column>
        <Separator />
        <Column align="center" justify="center">
          <Text size="h3" weight="bold">
            {data.readings.count}
          </Text>
          <Text size="label" color="c3">
            {t('read_books')}
          </Text>
        </Column>
      </Row>
      <Space height={60} />
      <Column align="flex-start" css={maxWidthCss}>
        {menuOptions.map((option) => (
          <Row
            key={option.label}
            touchable
            align="center"
            justify="space-between"
            onPress={option.onPress}
            css={optionCss}
          >
            <Row align="center">
              <Text size="button">{option.label}</Text>
            </Row>
            <Ionicons name="ios-chevron-forward-outline" size={20} color={theme.colors.c4} />
          </Row>
        ))}
      </Column>
    </Column>
  );
};

export default Profile;
