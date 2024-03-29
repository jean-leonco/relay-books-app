import AsyncStorage from '@react-native-community/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native';
import { fetchQuery, graphql, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
//import SplashScreen from 'react-native-splash-screen';

import { AUTH_KEY } from '../common/config';

import { RouterQuery } from './__generated__/RouterQuery.graphql';

import App from './AppRouter';
import AuthContext from './AuthContext';
import Auth from './AuthRouter';

const routerQuery = graphql`
  query RouterQuery {
    me {
      __typename
    }
  }
`;

const Router = ({ resetRelayEnvironment }) => {
  const environment = useRelayEnvironment();

  const data = useLazyLoadQuery<RouterQuery>(routerQuery, {});

  const refresh = useCallback(() => {
    fetchQuery(environment, routerQuery, {}).toPromise();
  }, [environment]);

  const authContext = useMemo(
    () => ({
      signIn: async (token: string) => {
        await AsyncStorage.setItem(AUTH_KEY, token);
        resetRelayEnvironment();
        refresh();
      },
      signOut: async () => {
        await AsyncStorage.removeItem(AUTH_KEY);
        resetRelayEnvironment();
        refresh();
      },
    }),
    [refresh, resetRelayEnvironment],
  );

  //useEffect(() => {
  // SplashScreen.hide();
  //}, [])

  return (
    <AuthContext.Provider value={authContext}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>{data?.me ? <App /> : <Auth />}</NavigationContainer>
      </SafeAreaView>
    </AuthContext.Provider>
  );
};

export default Router;
