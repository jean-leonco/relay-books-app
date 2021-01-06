import React from 'react';
import { useLazyLoadQuery, graphql } from 'react-relay/hooks';
import styled, { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Button, Column, Row, Space, Text } from '@workspace/ui';

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

const Profile = () => {
  const { signOut } = useRouterAuth();

  const navigation = useNavigation();

  const data = useLazyLoadQuery<ProfileQuery>(
    graphql`
      query ProfileQuery {
        me {
          fullName
          reviews(first: 1) @connection(key: "Profile_reviews", filters: []) {
            count
            edges {
              cursor
            }
          }
        }
        readings(first: 1, filters: { finished: true }) @connection(key: "Profile_readings", filters: []) {
          count
          edges {
            cursor
          }
        }
      }
    `,
    {},
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
      <Column align="flex-start" style={{ width: '100%' }}>
        <Button onPress={() => navigation.navigate('EditProfile')}>Edit Profile</Button>
        <Space height={20} />
        <Button type="bordered" onPress={signOut}>
          Log out
        </Button>
      </Column>
    </Column>
  );
};

export default Profile;
