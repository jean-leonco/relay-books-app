import 'react-native-gesture-handler';
import { Suspense, useCallback, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { StatusBar } from 'react-native';
import { RelayEnvironmentProvider } from 'react-relay';
import { ThemeProvider } from 'styled-components';

import { createRelayEnvironment } from '@workspace/relay';
import { ErrorBoundary, theme } from '@workspace/ui';

import { AUTH_KEY } from './common/config';
import i18n from './i18n';
import SuspenseFallback from './modules/common/SuspenseFallback';
import Router from './router/Router';

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
            <Suspense fallback={<SuspenseFallback />}>
              <Router resetRelayEnvironment={resetRelayEnvironment} />
            </Suspense>
          </ErrorBoundary>
        </ThemeProvider>
      </I18nextProvider>
    </RelayEnvironmentProvider>
  );
};

export default App;
