import 'react-native-gesture-handler';
import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { ThemeProvider } from 'styled-components';

import { ErrorBoundary, theme } from '@workspace/ui';
import { createRelayEnvironment } from '@workspace/relay';

import Router from './router/Router';
import SuspenseFallback from './modules/common/SuspenseFallback';

const App = () => {
  const [relayEnvironment, setRelayEnvironment] = useState(createRelayEnvironment());

  const resetRelayEnvironment = useCallback(() => {
    setRelayEnvironment(createRelayEnvironment());
  }, []);

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <StatusBar backgroundColor={theme.colors.statusBar} barStyle="dark-content" />
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <React.Suspense fallback={<SuspenseFallback />}>
            <Router resetRelayEnvironment={resetRelayEnvironment} />
          </React.Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </RelayEnvironmentProvider>
  );
};

export default App;
