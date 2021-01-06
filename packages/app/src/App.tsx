import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { ThemeProvider } from 'styled-components';

import { ErrorBoundary, theme } from '@workspace/ui';
import { Environment } from '@workspace/relay';

import Router from './router/Router';
import SuspenseFallback from './modules/common/SuspenseFallback';

const App = () => {
  return (
    <RelayEnvironmentProvider environment={Environment}>
      <StatusBar backgroundColor={theme.colors.statusBar} barStyle="dark-content" />
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <React.Suspense fallback={<SuspenseFallback />}>
            <Router />
          </React.Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </RelayEnvironmentProvider>
  );
};

export default App;
