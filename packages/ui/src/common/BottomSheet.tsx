import React from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { css } from 'styled-components';

import Column from './Column';

const panelHandleCss = css`
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  margin-bottom: 10px;
`;

const containerCss = css`
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 10px;
`;

const BottomSheet = ({ children, ...props }: Partial<ModalProps>) => {
  return (
    <Modal
      swipeDirection="down"
      style={{ flex: 1, margin: 0, justifyContent: 'flex-end' }}
      backdropOpacity={0.6}
      {...props}
    >
      <Column css={containerCss}>
        <Column align="center" justify="center">
          <Column css={panelHandleCss} />
        </Column>

        <Column css={containerCss}>{children}</Column>
      </Column>
    </Modal>
  );
};

export default BottomSheet;
