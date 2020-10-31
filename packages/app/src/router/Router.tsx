import React, { useCallback, useMemo } from 'react';
import { useLazyLoadQuery, graphql, useRelayEnvironment, fetchQuery } from 'react-relay/hooks';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
//import SplashScreen from 'react-native-splash-screen';

import { AUTH_KEY } from '../common/config';

import AuthContext from './AuthContext';
import Auth from './AuthRouter';
import App from './AppRouter';

import { RouterQuery } from './__generated__/RouterQuery.graphql';

const routerQuery = graphql`
  query RouterQuery {
    me {
      id
    }
  }
`;

const Router = () => {
  const environment = useRelayEnvironment();

  const data = useLazyLoadQuery<RouterQuery>(routerQuery, {});

  const refresh = useCallback(() => {
    fetchQuery(environment, routerQuery, {}).toPromise();
  }, [environment]);

  const authContext = useMemo(
    () => ({
      signIn: async (token: string) => {
        await AsyncStorage.setItem(AUTH_KEY, token);
        refresh();
      },
      signOut: async () => {
        await AsyncStorage.removeItem(AUTH_KEY);
        refresh();
      },
    }),
    [refresh],
  );

  //useEffect(() => {
  // SplashScreen.hide();
  //}, [])

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>{data?.me?.id ? <App /> : <Auth />}</NavigationContainer>
    </AuthContext.Provider>
  );
};

export default Router;
