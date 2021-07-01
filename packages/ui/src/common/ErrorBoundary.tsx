import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { css } from 'styled-components/native';

import { InvalidSessionError, UnavailableServiceError } from '@workspace/relay';

import Column from './Column';
import Space from './Space';
import Text from './Text';

const containerCss = css`
  background: #fff;
  padding: 20px;
`;

interface IState {
  error: Error | InvalidSessionError | UnavailableServiceError | null;
}

interface IErrorBoundaryProps {
  children: React.ReactNode;
  authKey: string;
  resetRelayEnvironment(): void;
}

class ErrorBoundary extends React.Component<IErrorBoundaryProps> {
  state: IState = { error: null };

  async componentDidCatch(error: Error) {
    const { authKey, resetRelayEnvironment } = this.props;

    this.setState({ error });

    if (error instanceof InvalidSessionError) {
      await AsyncStorage.removeItem(authKey);
      resetRelayEnvironment();
      this.setState({ error: null });
    }
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (error) {
      return (
        <Column align="center" justify="center" flex={1} css={containerCss}>
          <Text size="h3" weight="bold" center>
            Oops, an error occurred. Try again later
          </Text>
          <Space height={20} />
          <Text color="c3" center>
            Error: {error.message}
          </Text>
        </Column>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
