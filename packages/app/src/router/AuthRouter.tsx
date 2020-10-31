import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../modules/auth/Login';
import SignUp from '../modules/auth/SignUp';

const Stack = createStackNavigator();

const Auth = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
};

export default Auth;
