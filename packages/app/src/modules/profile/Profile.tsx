import React, { useMemo } from 'react';
import { useLazyLoadQuery, graphql } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'styled-components';

import { Column, Row, Space, Text } from '@workspace/ui';

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
  border-radius: 6px;
  border: ${(p) => `1px solid ${p.theme.colors.c2}`};
  ${maxWidthCss}
`;

const Profile = () => {
  const { signOut } = useRouterAuth();

  const navigation = useNavigation();

  const data = useLazyLoadQuery<ProfileQuery>(
    graphql`
      query ProfileQuery {
        me {
          fullName
          reviews(first: 1) @connection(key: "Profile_reviews") {
            count
            edges {
              cursor
            }
          }
        }
        readings(first: 1, filters: { finished: true }) @connection(key: "Profile_readings") {
          count
          edges {
            cursor
          }
        }
      }
    `,
    {},
  );

  const menuOptions = useMemo(
    () => [
      {
        icon: 'file-tray',
        label: 'My Reviews',
        onPress: () => navigation.navigate('ReviewList'),
      },
      {
        icon: 'person-outline',
        label: 'Edit Profile',
        onPress: () => navigation.navigate('EditProfile'),
      },
      {
        icon: 'exit-outline',
        label: 'Log out',
        onPress: signOut,
      },
    ],
    [navigation, signOut],
  );

  const theme = useTheme();

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
            Reviews
          </Text>
        </Column>
        <Separator />
        <Column align="center" justify="center">
          <Text size="h3" weight="bold">
            {data.readings.count}
          </Text>
          <Text size="label" color="c3">
            Read Books
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
              <Ionicons name={option.icon} size={20} color={theme.colors.c4} />
              <Space width={6} />
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
