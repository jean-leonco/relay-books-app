import 'react-native-gesture-handler';
import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';

import { ErrorBoundary, theme } from '@workspace/ui';
import { createRelayEnvironment } from '@workspace/relay';

import { AUTH_KEY } from './common/config';

import i18n from './i18n';
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
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <ErrorBoundary authKey={AUTH_KEY} resetRelayEnvironment={resetRelayEnvironment}>
            <React.Suspense fallback={<SuspenseFallback />}>
              <Router resetRelayEnvironment={resetRelayEnvironment} />
            </React.Suspense>
          </ErrorBoundary>
        </ThemeProvider>
      </I18nextProvider>
    </RelayEnvironmentProvider>
  );
};

export default App;
