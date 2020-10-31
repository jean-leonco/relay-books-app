import React from 'react';
import { css } from 'styled-components/native';

import { InvalidSessionError, UnavailableServiceError } from '@booksapp/relay';

import Text from './Text';
import Space from './Space';
import Column from './Column';

const containerCss = css`
  background: #fff;
  padding: 20px;
`;

interface IState {
  error: Error | InvalidSessionError | UnavailableServiceError | null;
}

interface IErrorBoundary {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<IErrorBoundary> {
  state: IState = { error: null };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (error instanceof InvalidSessionError) {
      // @TODO - do something
    }

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
