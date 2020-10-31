import React from 'react';
import styled, { css } from 'styled-components/native';

import { Column } from '@booksapp/ui';

import book from '../../assets/book.png';

const Placeholder = styled.Image`
  width: 130px;
  height: 130px;
`;

const containerCss = css`
  background: ${(p) => p.theme.colors.background};
`;

// @TODO - fix static images using monorepo and move to ui
const SuspenseFallback = () => {
  return (
    <Column flex={1} justify="center" align="center" css={containerCss}>
      <Placeholder source={book} />
    </Column>
  );
};

export default SuspenseFallback;
